// src/components/Button.jsx
export default function Button({ children, onClick, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}