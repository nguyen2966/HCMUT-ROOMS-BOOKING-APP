import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../Context/AuthContext";

export default function RoomQR({ roomId }) {
  const { accessToken } = useAuth();
  const [qrUrl, setQrUrl] = useState(null);

  useEffect(() => {
    if (!roomId || !accessToken) return;

    const fetchQr = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3069/study-space/${roomId}/qr`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        // ✅ Backend returns { qr_path: "https://..." }
        if (res.data.qr_path) {
          setQrUrl(res.data.qr_path);
        } else if (res.data.metaData?.qr_path) {
          setQrUrl(res.data.metaData.qr_path);
        } else {
          console.error("QR path not found in response:", res.data);
        }
      } catch (err) {
        console.error("❌ Failed to load QR:", err);
        setQrUrl(null);
      }
    };

    fetchQr();
  }, [roomId, accessToken]);

  if (!qrUrl) return <div>Loading QR...</div>;

  return (
    <div className="qr-small">
      <img src={qrUrl} alt={`QR for room ${roomId}`} />
    </div>
  );
}
