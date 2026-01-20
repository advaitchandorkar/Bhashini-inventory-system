import { Inter,IBM_Plex_Serif } from "next/font/google";
import "./globals.css";
import GlobalLoading from "@/components/GlobalLoading";
const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-ibm-plex-serif'
})
export const metadata = {
  title: "Inventory Management",
  description: "Inventory Management System by Aakash",
  icons:{
    icon:'/icons/l2.jpeg'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      
      <body className={`${inter.variable} ${ibmPlexSerif.variable}`}>
        <GlobalLoading>
        {children}
        </GlobalLoading>
        </body>
    </html>
  );
}
