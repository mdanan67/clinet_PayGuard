'use client';
import Navbar from '../Navbar/Navbar';

export default function HomePage() {
  const categories = [
    { name: 'Food', limit: '$200', icon: '🍔' },
    { name: 'Education', limit: '$300', icon: '📚' },
    { name: 'Transport', limit: '$150', icon: '🚌' },
    { name: 'Entertainment', limit: '$100', icon: '🎮' },
  ];

  const features = [
    {
      title: 'Category-wise Payments',
      description:
        'Parents can send money based on selected spending categories like food, transport, education, and more.',
      icon: '💳',
    },
    {
      title: 'Set Spending Limits',
      description:
        'Control how much your child can spend by setting a maximum amount for each category.',
      icon: '📊',
    },
    {
      title: 'Secure Online Payments',
      description:
        'All payments are handled online, making the process fast, secure, and easy to track.',
      icon: '🔒',
    },
    {
      title: 'Real-Time Tracking',
      description: 'Monitor transactions and remaining balance instantly from a simple dashboard.',
      icon: '📱',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar></Navbar>

      <header className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 md:grid-cols-2">
        <div>
          <p className="mb-3 inline-block rounded-full bg-slate-200 px-4 py-1 text-sm font-medium text-slate-700">
            Manage your child’s spending with confidence
          </p>
          <h2 className="mb-6 text-4xl font-bold leading-tight text-slate-900 md:text-6xl">
            Parent-Controlled Payments for Smarter Spending
          </h2>
          <p className="mb-8 max-w-xl text-lg text-slate-600">
            Let parents send category-based payments, set amount limits, and track every online
            transaction in one secure platform.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="rounded-2xl cursor-pointer bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow hover:bg-slate-800">
              Start Free
            </button>
            <button className="rounded-2xl border cursor-pointer border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100">
              Learn More
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-bold">Monthly Control Summary</h3>
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              Active
            </span>
          </div>

          <div className="space-y-4">
            {categories.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-slate-500">Parent-set limit</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-slate-900">{item.limit}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 text-center">
          <h3 className="text-3xl font-bold text-slate-900 md:text-4xl">Main Features</h3>
          <p className="mt-3 text-slate-600">
            Everything parents need to manage and monitor child spending safely.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200 transition hover:-translate-y-1"
            >
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h4 className="mb-3 text-xl font-bold">{feature.title}</h4>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="limits" className="bg-slate-900 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-2">
          <div>
            <h3 className="mb-4 text-3xl font-bold md:text-4xl">Set Better Spending Rules</h3>
            <p className="text-slate-300">
              Parents decide where money can be spent and how much can be used in each category.
              This helps children learn responsible financial habits while keeping spending safe.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
              <h4 className="text-lg font-semibold">Custom Categories</h4>
              <p className="mt-2 text-sm text-slate-300">
                Add limits for education, groceries, transport, shopping, and more.
              </p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
              <h4 className="text-lg font-semibold">Instant Monitoring</h4>
              <p className="mt-2 text-sm text-slate-300">
                Parents can instantly view where money is being used.
              </p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
              <h4 className="text-lg font-semibold">Safe Transactions</h4>
              <p className="mt-2 text-sm text-slate-300">
                All child payments happen through secure online payment channels.
              </p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
              <h4 className="text-lg font-semibold">Financial Learning</h4>
              <p className="mt-2 text-sm text-slate-300">
                Encourage children to manage money within healthy limits.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-3xl bg-white p-10 shadow-md ring-1 ring-slate-200">
          <h3 className="mb-4 text-3xl font-bold text-slate-900">Why Choose PayGuard?</h3>
          <p className="max-w-3xl text-slate-600">
            PayGuard helps families manage digital spending by combining parental control,
            category-based budgeting, and secure online transactions in one easy platform.
          </p>
        </div>
      </section>

      <footer id="contact" className="border-t bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-4">
          <div>
            <h4 className="text-xl font-bold">PayGuard</h4>
            <p className="mt-3 text-sm text-slate-600">
              Parent-controlled payments and smart child spending management.
            </p>
          </div>

          <div>
            <h5 className="mb-3 font-semibold">Quick Links</h5>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#limits">Limits</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="mb-3 font-semibold">Support</h5>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>Email: support@payguard.com</li>
              <li>Phone: +0081776782335</li>
              <li>Help Center</li>
            </ul>
          </div>

          <div>
            <h5 className="mb-3 font-semibold">Newsletter</h5>
            <p className="mb-3 text-sm text-slate-600">
              Get updates about new features and security improvements.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
              />
              <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-4 text-center text-sm text-slate-500">
          © 2026 PayGuard. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
