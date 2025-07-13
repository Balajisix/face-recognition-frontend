"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/Sidebar";

export default function FaceRegisterPage() {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) router.push("/admin/login");
  }, [router]);

  const startCamera = async () => {
    if (cameraStarted) return;

    const { FaceMesh } = await import("@mediapipe/face_mesh");
    const { Camera } = await import("@mediapipe/camera_utils");

    const EAR = (eye: [number, number][]) => {
      const dist = (p1: number[], p2: number[]) =>
        Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
      const A = dist(eye[1], eye[5]);
      const B = dist(eye[2], eye[4]);
      const C = dist(eye[0], eye[3]);
      return (A + B) / (2.0 * C);
    };

    const LEFT_EYE_IDX = [362, 385, 387, 263, 373, 380];
    const RIGHT_EYE_IDX = [33, 160, 158, 133, 153, 144];

    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results: any) => {
      if (results.multiFaceLandmarks.length > 0) {
        const lm = results.multiFaceLandmarks[0];
        const leftEye = LEFT_EYE_IDX.map(i => [lm[i].x, lm[i].y] as [number, number]);
        const rightEye = RIGHT_EYE_IDX.map(i => [lm[i].x, lm[i].y] as [number, number]);
        const avgEAR = (EAR(leftEye) + EAR(rightEye)) / 2;

        if (avgEAR < 0.21) {
          setBlinkDetected(true);
        }
      }
    });

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      const cam = new Camera(videoRef.current, {
        onFrame: async () => {
          await faceMesh.send({ image: videoRef.current! });
        },
        width: 640,
        height: 480,
      });

      cam.start();
      setCameraStarted(true);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraStarted(false);
  };

  const captureImage = () => {
    if (!blinkDetected) {
      setError("Please blink to confirm liveness before capturing.");
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL("image/jpeg");
      setPreview(dataURL);
      stopCamera();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!preview) return setError("Please capture an image first.");

    const blob = await (await fetch(preview)).blob();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("roll", rollNumber);
    formData.append("image", blob, "capture.jpg");

    const res = await fetch("http://localhost:5000/api/face_register", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <AdminSidebar />

      <main className="flex-1 p-6 bg-gradient-to-br from-blue-100 to-purple-200 pt-20 md:pt-10">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
            Register Face
          </h2>
          {error && (
            <p className="text-red-600 mb-4 text-center font-medium">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="text"
              placeholder="Roll Number"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            <div className="flex flex-col items-center">
              <video
                ref={videoRef}
                className="w-full max-w-md rounded-lg mb-4"
              />
              <button
                type="button"
                onClick={startCamera}
                className="mb-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Start Camera
              </button>
              <button
                type="button"
                onClick={captureImage}
                disabled={!blinkDetected}
                className={`${
                  blinkDetected
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                } text-white px-4 py-2 rounded`}
              >
                Capture Face
              </button>
              <p
                className={`text-sm font-medium mt-2 ${
                  blinkDetected ? "text-green-600" : "text-yellow-600"
                }`}
              >
                {blinkDetected
                  ? "Blink detected ✅ You can now capture"
                  : "Waiting for blink... 👁️"}
              </p>

              <canvas ref={canvasRef} hidden />
              <p className="text-sm text-gray-600 mb-2">
                Make sure only <strong>one person</strong> is in the frame and{" "}
                <strong>blink once</strong> before capturing.
              </p>
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-4 w-40 h-40 object-cover rounded-full border-2 border-blue-500"
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow"
            >
              Submit Registration
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
