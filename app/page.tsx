export default function Home() {
  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-6">Welcome to our DApp</h1>
      <p className="text-lg text-muted-foreground">
        This is a demo application showing our navigation bar with a logo on the
        left, navigation routes in the middle, and a wallet connect button on
        the right.
      </p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-border bg-card">
          <h2 className="text-2xl font-semibold mb-4">Sweep Tokens</h2>
          <p className="text-muted-foreground">
            Quickly sweep all tokens from one wallet to another in a single
            transaction.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card">
          <h2 className="text-2xl font-semibold mb-4">Revoke Approvals</h2>
          <p className="text-muted-foreground">
            Revoke unnecessary token approvals to improve your wallet security.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card">
          <h2 className="text-2xl font-semibold mb-4">Testing</h2>
          <p className="text-muted-foreground">
            Test your smart contracts and interactions in a safe environment.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <p className="text-muted-foreground">
            Connect your wallet using the button in the navigation bar to start
            using the DApp.
          </p>
        </div>
      </div>
    </main>
  );
}
