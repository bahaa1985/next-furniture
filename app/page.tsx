"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Dashboard() {
  const CLOUD_NAME = "dppcnl8qh";
  const UPLOAD_PRESET = "auto_upload";
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwEJ8SD8qsBA2BuAw6BHbCs_QcVgxS0ZE8zclzQfO-zThe0yXjOH_A8DknuxtNQHRcYBA/exec";

   type ImageItem = {
    id: string;
    imageUrl: string;
    description: string;
    date:string;
    row:number
  };
  
  const [file, setFile] = useState<File | null>(null);
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ImageItem[]>([]); 

  // -------------------------
  // رفع الصورة إلى Cloudinary
  // -------------------------
  async function uploadToCloudinary() {
    const fd = new FormData();
    if(!file) return;
    fd.append("file", file);
    fd.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: fd }
    );

    const data = await res.json();
    return data.secure_url;
  }

  // -------------------------
  // إضافة للشييت
  // -------------------------
  async function saveData() {
    if (!file) return alert("ارفع صورة أولاً");
    setLoading(true);

    const imageUrl = await uploadToCloudinary();

    await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "add",
        imageUrl,
        description: desc
      })
    });

    setDesc("");
    setFile(null);
    getData(); // تحديث القائمة
    setLoading(false);
  }

  // -------------------------
  // جلب البيانات من الشيت
  // -------------------------
  async function getData() {
    const res = await fetch(SCRIPT_URL);
    const data = await res.json();
    setItems(data);
  }

  useEffect(() => {
    getData();
  }, []);

  // -------------------------
  // حذف
  // -------------------------
  async function deleteItem(row:number) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;

    await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "delete",
        row
      })
    });

    getData();
  }

  // -------------------------
  // تعديل الوصف
  // -------------------------
  async function updateItem(row:number) {
    const newDesc = prompt("اكتب الوصف الجديد:");
    if (!newDesc) return;

    await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "update",
        row,
        description: newDesc
      })
    });

    getData();
  }

  return (
    <div className="min-h-screen p-10 bg-gray-100">
      <div className="grid md:grid-cols-2 gap-10">

        {/* ------------------------------ */}
        {/*        قسم رفع الصورة          */}
        {/* ------------------------------ */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">رفع صورة جديدة</h2>

          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mb-4"
          />

          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            placeholder="وصف الصورة"
          ></textarea>

          <button
            onClick={saveData}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            {loading ? "جاري الرفع..." : "حفظ"}
          </button>
        </div>


        {/* ------------------------------ */}
        {/*        قسم عرض الصور           */}
        {/* ------------------------------ */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">الصور المخزنة</h2>

          <div className="grid grid-cols-1 gap-4">
            {items.map((item) => (
              <div
                key={item.row}
                className="flex items-center gap-4 p-3 border rounded-lg">
                <Image
                  src={item.imageUrl}
                  alt={item.description || "صورة مخزنة"}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded"
                />              

                <div className="flex-1">
                  <p className="font-semibold">{item.description}</p>
                  <p className="text-sm text-gray-500">{item.date}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => updateItem(item.row)}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    تعديل
                  </button>

                  <button
                    onClick={() => deleteItem(item.row)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
