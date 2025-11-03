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
    <div className="dark:text-gray-100 w-full">
      {/* Header */}
      <div className="w-full mb-8">
        <h1 className="text-[#2d5f3f] dark:text-green-400 mb-2 text-2xl font-bold">
          Rekomendasi Permasalahan Petani
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Laporkan permasalahan, dapatkan rekomendasi AI, dan lihat tren masalah terkini petani kopi.
        </p>
      </div>

      {/* Form Masalah Baru */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-700 border-2 border-dashed border-[#2d5f3f] dark:border-green-600 w-full mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-[#2d5f3f] dark:text-green-400" />
          <h3 className="text-[#2d5f3f] dark:text-green-400 font-semibold">
            Laporkan Masalah Baru
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Deskripsikan masalah yang Anda hadapi di kebun kopi Anda. Laporan akan disimpan untuk analisis lebih lanjut.
        </p>

        {/* Field Nama Petani */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nama Petani <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Contoh: Pak Budi"
            value={namaPetani}
            onChange={(e) => setNamaPetani(e.target.value)}
            className="border-gray-300 dark:border-gray-600 focus:border-[#2d5f3f] dark:focus:border-green-600"
          />
        </div>

        {/* Field Masalah */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Deskripsi Masalah <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Contoh: Tanaman kopi saya terserang hama penggerek buah..."
            value={newProblem}
            onChange={(e) => setNewProblem(e.target.value)}
            className="border-gray-300 dark:border-gray-600 focus:border-[#2d5f3f] dark:focus:border-green-600"
          />
        </div>

        {/* Field Detail Tambahan */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Detail Tambahan (Opsional)
          </label>
          <Textarea
            placeholder="Format: key: value&#10;Contoh:&#10;Lokasi: Sumbersari&#10;Luas Lahan: 2 hektar&#10;Varietas: Arabika"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            className="border-gray-300 dark:border-gray-600 focus:border-[#2d5f3f] dark:focus:border-green-600 resize-none"
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
      <Card className="p-6 bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-700 shadow-lg border-0 w-full mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] rounded-xl flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-gray-100 font-semibold">
              Tanya Asisten AI
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Dapatkan rekomendasi dan solusi berbasis AI untuk masalah perkebunan kopi
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-4 h-[400px] overflow-y-auto border border-gray-100 dark:border-gray-700 shadow-inner">
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
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {msg.role === "ai" ? (
                    <div className="text-sm leading-relaxed space-y-4">
                      {msg.message.split('\n\n').map((section, idx) => {
                        const lines = section.split('\n');
                        const title = lines[0];
                        const content = lines.slice(1);
                        
                        return (
                          <div key={idx} className="space-y-2">
                            <div className="font-black text-[17px] text-gray-900 dark:text-white tracking-tight">
                              {title}
                            </div>
                            
                            <div className="space-y-1.5 text-gray-700 dark:text-gray-300">
                              {content.map((line, lineIdx) => {
                                if (!line.trim()) return null;
                                
                                if (line.trim().startsWith('•')) {
                                  return (
                                    <div key={lineIdx} className="pl-8 text-gray-600 dark:text-gray-400 text-sm">
                                      {line.trim()}
                                    </div>
                                  );
                                }
                                
                                if (line.startsWith('   ') && !line.trim().startsWith('•')) {
                                  return (
                                    <div key={lineIdx} className="pl-6 text-gray-600 dark:text-gray-400 text-sm">
                                      {line.trim()}
                                    </div>
                                  );
                                }
                                
                                return (
                                  <div key={lineIdx}>
                                    {line}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-line">{msg.message}</p>
                  )}
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
                <div className="w-8 h-8 bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
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
            className="flex-1 border-gray-300 dark:border-gray-600 focus:border-[#2d5f3f] dark:focus:border-green-600"
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
      <div className="w-full">
        <div className="grid grid-cols-2 gap-6">
          {/* Wordcloud Masalah */}
          <div className="w-full min-w-0">
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-md border-0 h-full">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#8b6f47] dark:text-[#b88746]" />
                <h3 className="text-gray-900 dark:text-gray-100 font-semibold">
                  Wordcloud Masalah Petani
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Visualisasi kata-kata yang paling sering muncul dalam laporan masalah petani kopi
              </p>
              <div className="relative h-[400px] bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl p-4 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700">
                {wordCloudWords.length > 0 ? (
                  <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-3 p-6">
                    {wordCloudWords.map((word, index) => {
                      const fontSize = Math.max(12, Math.min(40, 12 + word.value * 1.2));
                      const hue = (index * 37) % 360;
                      return (
                        <span
                          key={index}
                          className="transition-all duration-200 hover:scale-110 cursor-pointer select-none"
                          style={{
                            fontSize: `${fontSize}px`,
                            color: `hsl(${hue}, 65%, 45%)`,
                            fontWeight: word.value > 15 ? 700 : word.value > 8 ? 600 : 500,
                            textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                          }}
                          title={`${word.text}: ${word.value} kali`}
                        >
                          {word.text}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-400 dark:text-gray-500 mb-2">Memuat data...</p>
                    <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-[#2d5f3f] rounded-full mx-auto"></div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Wordcloud Pelatihan */}
          <div className="w-full min-w-0">
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-md border-0 h-full">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#8b6f47] dark:text-[#b88746]" />
                <h3 className="text-gray-900 dark:text-gray-100 font-semibold">
                  Wordcloud Pelatihan yang Dibutuhkan
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Jenis pelatihan yang paling banyak dibutuhkan oleh petani kopi
              </p>
              <div className="relative h-[400px] bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl p-4 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700">
                {wordCloudPelatihan.length > 0 ? (
                  <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-3 p-6">
                    {wordCloudPelatihan.map((word, index) => {
                      const fontSize = Math.max(12, Math.min(40, 12 + word.value * 1.2));
                      const hue = (index * 47 + 180) % 360;
                      return (
                        <span
                          key={index}
                          className="transition-all duration-200 hover:scale-110 cursor-pointer select-none"
                          style={{
                            fontSize: `${fontSize}px`,
                            color: `hsl(${hue}, 65%, 45%)`,
                            fontWeight: word.value > 15 ? 700 : word.value > 8 ? 600 : 500,
                            textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                          }}
                          title={`${word.text}: ${word.value} kali`}
                        >
                          {word.text}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-400 dark:text-gray-500 mb-2">Memuat data...</p>
                    <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-[#2d5f3f] rounded-full mx-auto"></div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}