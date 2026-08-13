import { QRCodeSVG } from 'qrcode.react';

export default function ResidentQR({ token, size = 280 }) {
  return (
    <div className="flex flex-col items-center rounded-3xl bg-white p-6 shadow-lg">
      <QRCodeSVG value={token} size={size} level="H" includeMargin />
    </div>
  );
}
