import TestForm from "@/components/test-form";

export default function TestPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Тест подключения к МойСклад
        </h1>
        <TestForm />
      </div>
    </div>
  );
}