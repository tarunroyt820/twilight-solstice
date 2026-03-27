import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { NotFound } from "./components/common/NotFound";
import { OnboardingFlow } from "./components/onboarding/OnboardingFlow";
import { PricingSection } from "./components/landing/PricingSection";
import { Navbar } from "./components/layout/Navbar";
import { HeroSection } from "./components/landing/HeroSection";
import { FeaturesSection } from "./components/landing/FeaturesSection";
import { HowItWorksSection } from "./components/landing/HowItWorksSection";
import { TestimonialsSection } from "./components/landing/TestimonialsSection";
import { CTASection } from "./components/landing/CTASection";
import { Footer } from "./components/layout/Footer";
import { AuthPage } from "./components/auth/AuthPage";
import { VerifyEmailPage } from "./components/auth/VerifyEmailPage";
import { ForgotPasswordPage } from "./components/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./components/auth/ResetPasswordPage";
import { Dashboard } from "./components/dashboard/Dashboard";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Toaster } from "sonner";

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem("nextro_token");
    if (token) return <Navigate to="/dashboard/overview" replace />;
    return children;
};

export default function App() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Toaster position="top-right" />
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/"
                    element={
                        <>
                            <Navbar />
                            <main>
                                <HeroSection />
                                <div className="teal-divider max-w-5xl mx-auto" />
                                <FeaturesSection />
                                <div className="teal-divider max-w-5xl mx-auto" />
                                <HowItWorksSection />
                                <div className="teal-divider max-w-5xl mx-auto" />
                                <TestimonialsSection />
                                <div className="teal-divider max-w-5xl mx-auto" />
                                <PricingSection />
                                <CTASection />
                            </main>
                            <Footer />
                        </>
                    }
                />
                <Route path="/login" element={<PublicRoute><AuthPage mode="login" /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><AuthPage mode="signup" /></PublicRoute>} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Protected Dashboard Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard/*" element={<Dashboard />} />
                    <Route path="/onboarding" element={<OnboardingFlow />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
}
