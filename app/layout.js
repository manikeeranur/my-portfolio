import "./globals.css";
import { AuthProvider } from "@/components/context/AuthContext";
import { MyResumeContextProvider } from "@/components/context/MyResumeContext";

export const metadata = {
  title: "Manikandan Arumugam | Portfolio",
  description: "Portfolio site of Manikandan Arumugam",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <MyResumeContextProvider>{children}</MyResumeContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
