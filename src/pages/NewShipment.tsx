import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Loader, XCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

export default function NewShipment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    package_id: "",
    to_address: "",
    from_address: "",
    sender_name: "",
    note: "",
  });

  const imageRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // 🎯 Show Preview
    }
  };

  const removeImage = (e: any) => {
    e.preventDefault();
    if(imageRef.current){
      imageRef.current.value = ""
    }
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!user) throw new Error("User not authenticated.");

      let image_url = "";
      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage
          .from("images/package")
          .upload(fileName, image);

        if (uploadError) throw uploadError;
        image_url = supabase.storage
          .from("images/package")
          .getPublicUrl(fileName).data.publicUrl;
      }

      const { error: insertError } = await supabase
        .from("shipments")
        .insert([{ ...formData, image_url, user_id: user.id }]);

      if (insertError) throw insertError;

      // navigate("/dashboard");

      setFormData({
        package_id: "",
        to_address: "",
        from_address: "",
        sender_name: "",
        note: "",
      })
      setImage(null);
      setImagePreview(null);
      alert("Shipment created successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-4 max-w-3xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
          📦 New Shipment
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Package ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Package ID
            </label>
            <input
              type="text"
              name="package_id"
              required
              value={formData.package_id}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              placeholder="Enter Package ID"
            />
          </div>

          {/* Sender Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sender Name
            </label>
            <input
              type="text"
              name="sender_name"
              required
              value={formData.sender_name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              placeholder="Enter Sender's Name"
            />
          </div>

          {/* From Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              From Address
            </label>
            <input
              type="text"
              name="from_address"
              required
              value={formData.from_address}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              placeholder="Enter Pickup Address"
            />
          </div>

          {/* To Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              To Address
            </label>
            <input
              type="text"
              name="to_address"
              required
              value={formData.to_address}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              placeholder="Enter Destination Address"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Note (Optional)
            </label>
            <textarea
              name="note"
              rows={3}
              value={formData.note}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              placeholder="Additional shipment details..."
            />
          </div>

          {/* Image Upload with Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Image (Optional)
            </label>

            <label
              htmlFor="image-upload"
              className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 cursor-pointer hover:border-indigo-500"
            >
              <div className="text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-40 w-auto rounded-md shadow-md mx-auto"
                    />
                    <button
                      onClick={removeImage}
                      type="button"
                      className="absolute top-2 right-2 bg-white rounded-full p-1 text-red-500 hover:text-red-700"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-600">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </>
                )}
              </div>
              {/* Hidden File Input (Triggers on Click) */}
              <input
                ref={imageRef}
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Creating shipment...
                </>
              ) : (
                "Create Shipment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
