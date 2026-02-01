"use client";

import { PageWrapper } from "@struggleforum/ui";
import PageHeader from "@/components/UI/PageHeader";
import TextBox from "@/components/UI/TextBox";
import ParagraphLayout from "@/components/UI/ParagraphLayout";
import { CTButton } from "@struggleforum/ui";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    setTimeout(() => {
      console.log("Form submitted:", formData);
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 3000);
    }, 1000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <PageWrapper>
      <PageHeader>
        <h1 className="text-5xl">Contact Us</h1>
        <h3 className="text-3xl text-sky-400">Reach out to Struggle Forum</h3>
      </PageHeader>

      <TextBox className="max-w-[900px] mx-auto w-full">
        <h3 className="text-3xl mb-4">Get in Touch</h3>
        <ParagraphLayout className="mb-6">
          Have questions, feedback, or want to collaborate? Fill out the form
          below or contact us directly via email or social media.
        </ParagraphLayout>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="text-sky-300 font-semibold text-left"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-slate-800/80 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60 focus:border-sky-400 transition-all"
              placeholder="Your name"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sky-300 font-semibold text-left"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-slate-800/80 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60 focus:border-sky-400 transition-all"
              placeholder="your.email@example.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="message"
              className="text-sky-300 font-semibold text-left"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-3 rounded-lg bg-slate-800/80 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60 focus:border-sky-400 transition-all resize-y"
              placeholder="Your message..."
            />
          </div>

          <CTButton
            variant="primary"
            size="lg"
            className="mt-2"
            onClick={() => handleSubmit}
          >
            {status === "sending"
              ? "Sending..."
              : status === "success"
                ? "Sent! ✓"
                : "Send Message"}
          </CTButton>

          {status === "success" && (
            <p className="text-green-400 text-center animate-fade-in">
              Thank you! Your message has been sent successfully.
            </p>
          )}
        </form>

        {/* Direct Contact Info */}
        <div className="mt-8 pt-8 border-t border-slate-600"></div>
      </TextBox>
    </PageWrapper>
  );
}
