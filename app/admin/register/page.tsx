"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/Sidebar";

export default function FaceRegisterPage() {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) router.push("/admin/login");
  }, [router]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError("Unable to access camera.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL("image/jpeg");
      setPreview(dataURL);
      stopCamera(); // optional, stops after capture
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
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Register Face</h2>
          {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
          
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
              <video ref={videoRef} className="w-full max-w-md rounded-lg mb-4" />
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
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Capture Face
              </button>
              <canvas ref={canvasRef} hidden />
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
