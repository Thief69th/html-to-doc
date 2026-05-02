import './globals.css';

export const metadata = {
  title: 'html2doc — Convert HTML to Word',
  description: 'Fast, clean converter. Upload any HTML file and download it as a .docx Word document instantly.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230c0c0b'/><text y='24' x='4' font-size='22'>📄</text></svg>",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
