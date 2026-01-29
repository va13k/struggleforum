import Link from "next/link";
import Image from "next/image";
import { SiGmail } from "react-icons/si";
import { FaInstagram } from "react-icons/fa";
import { FaDiscord } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full py-2.5 px-5 text-2xl font-bold text-white bg-slate-800/80 shadow-[0_2px_10px_rgba(0,0,0,0.3)] z-50 flex flex-col justify-center items-center">
      <ul
        className="flex justify-center items-center gap-5 text-sky-400 text-3xl mb-5
        [&>li>a]:transition-shadow [&>li>a]:hover:shadow-[0_2px_10px_rgba(255,255,255,0.5)] [&>li>a]:hover:text-sky-300"
      >
        <li>
          <Link href="mailto:info.eminbairamov@gmail.com">
            <SiGmail />
          </Link>
        </li>
        <li>
          <Link href="https://www.instagram.com/struggleformula/">
            <FaInstagram />
          </Link>
        </li>
        <li>
          <Link href="#">
            <FaDiscord />
          </Link>
        </li>
      </ul>
      <h1 className="text-lg">© Emin Bairamov 2025</h1>
    </footer>
  );
}
