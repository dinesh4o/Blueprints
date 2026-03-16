import { RepurposingAlternativeFinder } from "@/components/RepurposingAlternativeFinder";

export default function RepurposingPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 tracking-tight">Structurally Related Repurposing</h1>
      <p className="text-muted-foreground mb-8 text-lg">
        Identify structurally related compounds and 3D molecular twins to evaluate potential alternative candidates for repurposing.
      </p>
      <RepurposingAlternativeFinder />
    </div>
  );
}
