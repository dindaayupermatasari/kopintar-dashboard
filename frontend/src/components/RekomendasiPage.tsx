import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Sparkles, Send, Bot, User, Plus, CheckCircle, AlertCircle } from "lucide-react";
import { getRecommendation, submitLaporanMasalah, formatRecommendation, DetailPetani } from "../api/recommendation";
import api from "../api/api";

export function RekomendasiPage() {
  const [namaPetani, setNamaPetani] = useState("");
  const [newProblem, setNewProblem] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: "user" | "ai"; message: string }>
  >([
    {
      role: "ai",
      message:
        "Halo! Saya asisten AI yang siap membantu masalah di perkebunan kopi ☕🌱\n\nCeritakan masalah yang Anda hadapi, dan saya akan memberikan rekomendasi solusi yang praktis!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const [wordCloudWords, setWordCloudWords] = useState<{ text: string; value: number }[]>([]);
  const [wordCloudPelatihan, setWordCloudPelatihan] = useState<{ text: string; value: number }[]>([]);

  // Fetch Wordcloud data
  useEffect(() => {
    const fetchWordCloud = async () => {
      try {
        const [masalahRes, pelatihanRes] = await Promise.all([
          api.get("/analysis/wordcloud-data"),
          api.get("/analysis/wordcloud-pelatihan"),
        ]);

        if (Array.isArray(masalahRes.data)) setWordCloudWords(masalahRes.data);
        if (Array.isArray(pelatihanRes.data)) setWordCloudPelatihan(pelatihanRes.data);
      } catch (err) {
        console.error("Gagal memuat data wordcloud:", err);
      }
    };
    fetchWordCloud();
  }, []);

  // Helper: parsing textarea menjadi object { key: value }
  const parseAdditionalInfo = (text: string): DetailPetani => {
    const obj: DetailPetani = {};
    text.split("\n").forEach((line) => {
      const [key, ...rest] = line.split(":");
      if (key && rest.length) {
        obj[key.trim()] = rest.join(":").trim();
      }
    });
    return obj;
  };

  // Kirim pesan ke AI
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: "user" as const, message: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsLoading(true);

    try {
      const detailPetaniObj = additionalInfo.trim() === "" ? {} : parseAdditionalInfo(additionalInfo);
      const res = await getRecommendation(chatInput, detailPetaniObj);
      const aiResponse = formatRecommendation(res.recommendation);

      setChatMessages((prev) => [...prev, { role: "ai", message: aiResponse }]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "ai",
          message:
            "⚠️ Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit masalah baru ke database
  const handleSubmitProblem = async () => {
    if (!namaPetani.trim() || !newProblem.trim()) {
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 3000);
      return;
    }

    try {
      const detailPetaniObj = additionalInfo.trim() === "" ? {} : parseAdditionalInfo(additionalInfo);
      await submitLaporanMasalah(newProblem, namaPetani, detailPetaniObj);
      setSubmitStatus("success");
      setNamaPetani("");
      setNewProblem("");
      setAdditionalInfo("");

      // Refresh wordcloud data
      const masalahRes = await api.get("/analysis/wordcloud-data");
      if (Array.isArray(masalahRes.data)) setWordCloudWords(masalahRes.data);

      setTimeout(() => setSubmitStatus("idle"), 3000);
    } catch (err) {
      console.error(err);
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 3000);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8 transition-colors duration-300">
      {/* Header */}
      <div className="w-full min-w-0 mb-4 sm:mb-6">
        <h1 className="text-[#2d5f3f] dark:text-[#b88746] mb-2">
          Rekomendasi Permasalahan Petani
        </h1>
        <p className="text-gray-600 dark:text-[#a3a3a3] text-sm sm:text-base">
          Laporkan permasalahan, dapatkan rekomendasi AI, dan lihat tren masalah terkini petani kopi.
        </p>
      </div>

      {/* Form Masalah Baru */}
      <Card className="w-full min-w-0 p-4 sm:p-6 bg-white dark:bg-[#242424] border-2 border-dashed border-[#2d5f3f] dark:border-[#4a7c59] shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-[#2d5f3f] dark:text-[#b88746]" />
          <h3 className="text-[#2d5f3f] dark:text-[#b88746]">
            Laporkan Masalah Baru
          </h3>
        </div>

        <div className="mb-3">
          <label className="block text-sm text-gray-700 dark:text-[#d4d4d4] mb-2">
            Nama Petani <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Contoh: Pak Budi"
            value={namaPetani}
            onChange={(e) => setNamaPetani(e.target.value)}
            className="border-gray-300 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm text-gray-700 dark:text-[#d4d4d4] mb-2">
            Deskripsi Masalah <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Contoh: Tanaman kopi saya terserang hama penggerek buah..."
            value={newProblem}
            onChange={(e) => setNewProblem(e.target.value)}
            className="border-gray-300 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-700 dark:text-[#d4d4d4] mb-2">
            Detail Tambahan (Opsional)
          </label>
          <Textarea
            placeholder="Format: key: value&#10;Contoh:&#10;Lokasi: Sumbersari&#10;Luas Lahan: 2 hektar&#10;Varietas: Arabika"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            className="border-gray-300 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-[#e5e5e5] resize-none"
            rows={4}
          />
        </div>

        <Button
          onClick={handleSubmitProblem}
          disabled={submitStatus === "success"}
          className="w-full bg-gradient-to-r from-[#2d5f3f] to-[#4a7c59] hover:from-[#3d7050] hover:to-[#5a8c69] text-white gap-2 disabled:opacity-50"
        >
          {submitStatus === "success" ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Berhasil Disimpan!
            </>
          ) : submitStatus === "error" ? (
            <>
              <AlertCircle className="w-4 h-4" />
              Gagal Menyimpan
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Kirim Laporan
            </>
          )}
        </Button>
      </Card>

      {/* Chat Asisten AI */}
      <Card className="w-full min-w-0 p-4 sm:p-6 bg-white dark:bg-[#242424] shadow-xl border-0 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-[#e5e5e5]">
              Tanya Asisten AI
            </h2>
            <p className="text-sm text-gray-600 dark:text-[#a3a3a3]">
              Dapatkan rekomendasi dan solusi berbasis AI untuk masalah perkebunan kopi
            </p>
          </div>
        </div>

        {/* Chat Box */}
        <div className="bg-gray-50 dark:bg-[#121212] rounded-xl p-4 mb-4 h-[400px] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-inner transition-colors duration-300">
          <div className="space-y-4">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "ai" && (
                  <div className="w-8 h-8 bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-[#8b6f47] to-[#a78a5e] text-white"
                      : "bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] text-white shadow-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {msg.message}
                  </p>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 bg-gradient-to-br from-[#8b6f47] to-[#a78a5e] rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] rounded-2xl px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Chat */}
        <div className="flex gap-3">
          <Input
            placeholder="Ketik pertanyaan Anda di sini..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendChat()}
            disabled={isLoading}
            className="flex-1 border-gray-300 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
          />
          <Button
            onClick={handleSendChat}
            disabled={isLoading || !chatInput.trim()}
            className="bg-gradient-to-r from-[#2d5f3f] to-[#4a7c59] hover:from-[#3d7050] hover:to-[#5a8c69] text-white px-6 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Wordcloud Section */}
      <div className="w-full min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Wordcloud Masalah */}
          <Card className="w-full p-4 sm:p-6 bg-white dark:bg-[#242424] shadow-xl border-0">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#8b6f47] dark:text-[#b88746]" />
              <h3 className="text-gray-900 dark:text-[#e5e5e5]">
                Wordcloud Masalah Petani
              </h3>
            </div>
            <div className="relative h-[500px] sm:h-[550px] bg-gray-50 dark:bg-[#121212] rounded-xl border dark:border-gray-700 overflow-hidden">
              {wordCloudWords.length > 0 ? (
                <div className="absolute inset-0 p-6 flex flex-wrap content-center justify-center gap-3 overflow-y-auto">
                  {wordCloudWords.map((word, i) => {
                    const fontSize = Math.max(16, Math.min(52, 16 + word.value * 1.3));
                    const hue = 30 + (i * 15) % 60;
                    return (
                      <span
                        key={i}
                        style={{
                          fontSize: `${fontSize}px`,
                          color: `hsl(${hue}, 65%, 45%)`,
                          fontWeight: word.value > 15 ? 700 : word.value > 8 ? 600 : 500,
                          lineHeight: 1.2,
                        }}
                        className="hover:scale-110 transition-transform cursor-pointer select-none flex-shrink-0"
                        title={`${word.text}: ${word.value}`}
                      >
                        {word.text}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                  Memuat data...
                </div>
              )}
            </div>
          </Card>

          {/* Wordcloud Pelatihan */}
          <Card className="w-full p-4 sm:p-6 bg-white dark:bg-[#242424] shadow-xl border-0">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#8b6f47] dark:text-[#b88746]" />
              <h3 className="text-gray-900 dark:text-[#e5e5e5]">
                Wordcloud Pelatihan yang Dibutuhkan
              </h3>
            </div>
            <div className="relative h-[500px] sm:h-[550px] bg-gray-50 dark:bg-[#121212] rounded-xl border dark:border-gray-700 overflow-hidden">
              {wordCloudPelatihan.length > 0 ? (
                <div className="absolute inset-0 p-6 flex flex-wrap content-center justify-center gap-3 overflow-y-auto">
                  {wordCloudPelatihan.map((word, i) => {
                    const fontSize = Math.max(16, Math.min(52, 16 + word.value * 1.3));
                    const hue = 90 + (i * 20) % 80;
                    return (
                      <span
                        key={i}
                        style={{
                          fontSize: `${fontSize}px`,
                          color: `hsl(${hue}, 65%, 45%)`,
                          fontWeight: word.value > 15 ? 700 : word.value > 8 ? 600 : 500,
                          lineHeight: 1.2,
                        }}
                        className="hover:scale-110 transition-transform cursor-pointer select-none flex-shrink-0"
                        title={`${word.text}: ${word.value}`}
                      >
                        {word.text}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                  Memuat data...
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}