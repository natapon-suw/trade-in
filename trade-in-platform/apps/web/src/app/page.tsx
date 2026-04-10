import { PublicHeader } from '../components/public-header';

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <div className="mx-auto max-w-7xl px-4 py-16 flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold tracking-tight">Trade-In Platform</h2>
      <p className="mt-4 text-gray-600">
        Second-hand electronics trade-in management system
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold">Admin Portal</h3>
          <p className="mt-2 text-sm text-gray-500">
            Assess, test, grade, and price trade-in products
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold">Seller Portal</h3>
          <p className="mt-2 text-sm text-gray-500">
            Check estimated trade-in value for your devices
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold">Buyer Portal</h3>
          <p className="mt-2 text-sm text-gray-500">
            Browse available second-hand electronics
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
