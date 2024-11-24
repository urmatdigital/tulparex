import RegistrationForm from "@/components/forms/registration-form";

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Регистрация</h1>
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <RegistrationForm />
        </div>
      </div>
    </div>
  );
}