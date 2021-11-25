export const validateQRValue = (qrCode: string): boolean => {
  const regex =
    /(cekin):(qr:[0-9]{10}):([A-Za-z0-9]{30}):(\d+\.?\d*):([0-9]{10}):((-|)+\d+\.?\d*)\w/;
  return regex.test(qrCode);
};

export const extractQRHash = (qrCode: string): string => {
  const regex =
    /(cekin):(qr:[0-9]{10}):([A-Za-z0-9]{30}):(\d+\.?\d*):([0-9]{10}):((-|)+\d+\.?\d*)\w/;
  const match = regex.exec(qrCode);
  if (match) {
    return match[2];
  }

  throw new Error("Invalid QR Code");
};

export const generateRandomString = (length = 30): string => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};
