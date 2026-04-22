export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-40 -top-[100px] -left-[100px]"
          style={{ background: 'var(--color-purple)', filter: 'blur(100px)', animation: 'orbFloat 8s ease-in-out infinite alternate' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-40 -bottom-[80px] -right-[80px]"
          style={{ background: 'var(--color-pink)', filter: 'blur(100px)', animation: 'orbFloat 8s ease-in-out infinite alternate 3s' }} />
        <div className="absolute w-[300px] h-[300px] rounded-full opacity-40 top-[40%] left-[60%]"
          style={{ background: 'var(--color-cyan)', filter: 'blur(100px)', animation: 'orbFloat 8s ease-in-out infinite alternate 5s' }} />
      </div>
      <div className="relative z-10 w-full max-w-[420px] px-5">
        {children}
      </div>
    </div>
  );
}
