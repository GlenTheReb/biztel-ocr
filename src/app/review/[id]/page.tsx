export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Review Document #{id}</h2>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-400">
        <p>Side-by-side review workflow will go here.</p>
      </div>
    </div>
  );
}
