
import 'tailwindcss/tailwind.css'


export default function Register() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form className="max-w-sm w-full bg-white p-6 rounded shadow">
                <h1 className="text-2xl font-bold mb-6">Register</h1>
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Email</label>
                    <input
                        type="email"
                        className="border rounded w-full py-2 px-3 text-gray-700"
                        placeholder="Enter your email"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Password</label>
                    <input
                        type="password"
                        className="border rounded w-full py-2 px-3 text-gray-700"
                        placeholder="Enter your password"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"
                >
                    Register
                </button>
            </form>
        </div>
    );
}