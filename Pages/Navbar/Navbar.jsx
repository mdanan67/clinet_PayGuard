'use client';
import Link from 'next/link';
const Navbar = () => {
  return (
    <div>
      {' '}
      <nav className="sticky top-0 z-50  bg-white/90 ">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">PayGuard</h1>
            <p className="text-sm text-slate-500">Smart parent</p>
          </div>

          <div className="hidden gap-6 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Features
            </a>
            <a href="#limits" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Limits
            </a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              About
            </a>
            <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Contact
            </a>
          </div>

          <div className="flex gap-3">
            <Link href="/user/login">
              {' '}
              <button className="rounded-xl  cursor-pointer border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100">
                Login
              </button>
            </Link>
            <Link href="/user/registration">
              <button className="rounded-xl cursor-pointer bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
