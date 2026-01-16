'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-void text-text-secondary antialiased selection:bg-gold/20 selection:text-gold-bright overflow-x-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-rose/5 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-nav transition-all duration-300">
        <div className="flex h-16 md:h-20 max-w-7xl mx-auto px-4 md:px-6 items-center justify-between">
          {/* Logo - visible on mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-bright flex items-center justify-center shadow-gold">
              <span className="font-serif font-bold text-sm text-void">ET</span>
            </div>
            <p className="text-text-tertiary text-sm">Evolution of Todo</p>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-normal text-text-secondary tracking-wide">
            <a href="#features" className="transition-colors hover:text-gold-bright">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-gold-bright">Methodology</a>
            <a href="#testimonials" className="transition-colors hover:text-gold-bright">Stories</a>
            <a href="#faq" className="transition-colors hover:text-gold-bright">FAQ</a>
          </div>

          {/* Auth buttons - always visible */}
          <div className="flex items-center gap-2 md:gap-6">
            <Link
              href="/login"
              className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors text-text-secondary hover:text-text-primary border border-white/10 rounded-sm hover:border-gold/30"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-3 md:px-6 py-2 md:py-2.5 rounded-sm btn-gold text-xs md:text-sm font-semibold tracking-wide uppercase"
            >
              <span className="hidden sm:inline">Get Access</span>
              <span className="sm:hidden">Join</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-32 pb-16 flex flex-col justify-center overflow-hidden">
        <div className="grid lg:grid-cols-2 w-full max-w-7xl mx-auto px-6 gap-x-16 gap-y-12 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="space-y-10 z-10"
          >
            <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tight leading-[1] text-text-primary">
              Order from <br />
              <span className="text-gradient-gold italic pr-2">Chaos.</span>
            </h1>

            <p className="text-xl max-w-lg leading-relaxed text-text-secondary font-light">
              An elegant workspace for the focused mind. Orchestrate your life with a tool designed for clarity, depth, and purpose.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-sm btn-gold font-semibold text-deep"
              >
                Begin Journey
                <Icon icon="lucide:arrow-right" className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-6 text-xs font-medium text-text-tertiary tracking-wide uppercase">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:shield-check" className="text-gold" />
                Secure
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:infinity" className="text-rose" />
                Unlimited
              </div>
            </div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative z-10 hidden lg:block"
          >
            {/* Decorative Glows */}
            <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute -bottom-32 -left-20 w-[400px] h-[400px] bg-rose/5 rounded-full blur-[100px]" />

            {/* Mockup Container */}
            <div className="relative w-full aspect-[4/3] glass-card rounded-md border p-1 animate-float border-white/5 bg-deep">
              {/* App Window */}
              <div className="w-full h-full bg-void rounded-sm overflow-hidden flex flex-col">
                {/* Window Header */}
                <div className="h-12 bg-deep border-b flex items-center px-5 gap-3 border-white/5">
                  <div className="flex gap-2 opacity-50">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose" />
                    <div className="w-2.5 h-2.5 rounded-full bg-gold" />
                    <div className="w-2.5 h-2.5 rounded-full bg-gold-dim" />
                  </div>
                  <div className="ml-auto text-[10px] font-mono text-text-tertiary tracking-widest opacity-50">EVOLUTION_OS</div>
                </div>

                {/* Window Content */}
                <div className="flex-1 p-8 flex gap-8">
                  {/* Sidebar */}
                  <div className="w-1/4 flex flex-col gap-6 border-r pr-6 border-white/5">
                    <div className="h-6 w-20 rounded bg-white/5" />
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center gap-3 text-gold-bright">
                        <div className="w-1 h-4 bg-gold rounded-full" />
                        <div className="h-2 w-16 rounded bg-white/10" />
                      </div>
                      <div className="h-2 w-12 rounded bg-white/5 ml-4" />
                      <div className="h-2 w-14 rounded bg-white/5 ml-4" />
                    </div>
                  </div>
                  {/* Main Area */}
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="flex justify-between items-end border-b border-white/5 pb-4">
                      <div className="h-8 w-32 bg-gradient-to-r from-white/10 to-transparent rounded" />
                      <div className="h-6 w-6 rounded-full border border-gold/30" />
                    </div>
                    {/* Task Items */}
                    <div className="space-y-4 mt-2">
                      <div className="p-4 rounded bg-surface border flex items-center gap-4 border-white/5 hover:border-gold/30 transition-colors group">
                        <div className="w-4 h-4 rounded-full border border-gold/50 group-hover:bg-gold/20 transition-colors" />
                        <div className="h-2 w-1/2 rounded bg-white/10" />
                        <div className="ml-auto text-[10px] tracking-widest uppercase text-gold-dim font-medium">Urgent</div>
                      </div>
                      <div className="p-4 rounded bg-surface border flex items-center gap-4 border-white/5 opacity-40">
                        <div className="w-4 h-4 rounded-full border border-text-tertiary bg-text-tertiary/20 flex items-center justify-center">
                          <Icon icon="lucide:check" className="w-2.5 h-2.5 text-text-tertiary" />
                        </div>
                        <div className="h-2 w-1/3 rounded bg-white/10" />
                      </div>
                      <div className="p-4 rounded bg-surface border flex items-center gap-4 border-white/5">
                        <div className="w-4 h-4 rounded-full border border-rose/50" />
                        <div className="h-2 w-2/3 rounded bg-white/10" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <span className="text-gold font-medium tracking-widest text-xs uppercase border-b border-gold/30 pb-1">Capabilities</span>
            <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-text-primary">
              Engineered for <span className="italic text-text-tertiary">Flow</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-text-secondary font-light">
              Tools that retreat when you&apos;re focused and appear when you need them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-card p-10 rounded-sm group"
            >
              <div className="w-12 h-12 rounded-sm bg-gold/5 border border-gold/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Icon icon="lucide:layers" className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-2xl font-serif font-medium mb-4 text-text-primary">Contextual Stacking</h3>
              <p className="text-sm leading-relaxed text-text-secondary font-light">
                Intelligently groups related tasks. The interface adapts to show only what is relevant now.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card p-10 rounded-sm group"
            >
              <div className="w-12 h-12 rounded-sm bg-rose/5 border border-rose/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Icon icon="lucide:flame" className="w-6 h-6 text-rose" />
              </div>
              <h3 className="text-2xl font-serif font-medium mb-4 text-text-primary">Momentum Tracking</h3>
              <p className="text-sm leading-relaxed text-text-secondary font-light">
                Visualise your consistency. Golden streaks encourage daily discipline without pressure.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card p-10 rounded-sm group"
            >
              <div className="w-12 h-12 rounded-sm bg-gold/5 border border-gold/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Icon icon="lucide:layout-grid" className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-2xl font-serif font-medium mb-4 text-text-primary">Macro Views</h3>
              <p className="text-sm leading-relaxed text-text-secondary font-light">
                Step back from the details. See the landscape of your projects in a unified dashboard.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-card p-10 rounded-sm group"
            >
              <div className="w-12 h-12 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Icon icon="lucide:clock" className="w-6 h-6 text-text-primary" />
              </div>
              <h3 className="text-2xl font-serif font-medium mb-4 text-text-primary">Temporal Awareness</h3>
              <p className="text-sm leading-relaxed text-text-secondary font-light">
                A timeline that understands urgency. Smart nudges keep you aligned with your goals.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-card p-10 rounded-sm group"
            >
              <div className="w-12 h-12 rounded-sm bg-gold/5 border border-gold/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Icon icon="lucide:zap" className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-2xl font-serif font-medium mb-4 text-text-primary">Deep Focus Mode</h3>
              <p className="text-sm leading-relaxed text-text-secondary font-light">
                Banish distractions. The interface dims, highlighting only the singular task at hand.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="glass-card p-10 rounded-sm group"
            >
              <div className="w-12 h-12 rounded-sm bg-rose/5 border border-rose/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Icon icon="lucide:arrow-left-right" className="w-6 h-6 text-rose" />
              </div>
              <h3 className="text-2xl font-serif font-medium mb-4 text-text-primary">Seamless Sync</h3>
              <p className="text-sm leading-relaxed text-text-secondary font-light">
                Fluid continuity across devices. Your state is preserved perfectly in the cloud.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 bg-void">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-4 text-text-primary">Three Steps to Clarity</h2>
            <p className="text-text-secondary font-light">Simplicity is the ultimate sophistication.</p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-16">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent border-t border-dashed border-white/10" />

            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-surface to-void border border-white/5 flex items-center justify-center relative z-10 mb-8 group-hover:border-gold/30 transition-all duration-500 shadow-2xl">
                <span className="absolute -top-2 -right-2 text-5xl font-serif text-white/5 font-bold">1</span>
                <Icon icon="lucide:user-plus" className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-2xl font-serif font-medium mb-3 text-text-primary">Initiate</h3>
              <p className="text-sm max-w-xs text-text-secondary leading-relaxed font-light">
                Create your secure account. No friction, just immediate access to your new workspace.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-surface to-void border border-white/5 flex items-center justify-center relative z-10 mb-8 group-hover:border-rose/30 transition-all duration-500 shadow-2xl">
                <span className="absolute -top-2 -right-2 text-5xl font-serif text-white/5 font-bold">2</span>
                <Icon icon="lucide:pen-line" className="w-8 h-8 text-rose" />
              </div>
              <h3 className="text-2xl font-serif font-medium mb-3 text-text-primary">Capture</h3>
              <p className="text-sm max-w-xs text-text-secondary leading-relaxed font-light">
                Dump your mind. Input tasks, dreams, and deadlines. Let the system organize them.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-surface to-void border border-white/5 flex items-center justify-center relative z-10 mb-8 group-hover:border-gold/30 transition-all duration-500 shadow-2xl">
                <span className="absolute -top-2 -right-2 text-5xl font-serif text-white/5 font-bold">3</span>
                <Icon icon="lucide:bar-chart-2" className="w-8 h-8 text-gold-bright" />
              </div>
              <h3 className="text-2xl font-serif font-medium mb-3 text-text-primary">Evolve</h3>
              <p className="text-sm max-w-xs text-text-secondary leading-relaxed font-light">
                Review your analytics. Watch your productivity compound day after day.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 relative overflow-hidden bg-deep">
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-2 text-text-primary">Voices of the Community</h2>
            <p className="text-text-tertiary font-light">High performers share their experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-sm relative"
            >
              <Icon icon="lucide:quote" className="absolute top-8 right-8 w-12 h-12 text-gold/10" />
              <p className="leading-relaxed mb-8 text-text-secondary font-light text-lg">
                &quot;Evolution of Todo isn&apos;t just an app; it&apos;s a philosophy. It forced me to prioritize what actually matters. The interface is stunning.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-sm flex items-center justify-center text-sm font-bold bg-surface border border-white/5 text-gold font-serif">SK</div>
                <div>
                  <div className="font-medium text-text-primary font-serif">Sarah K.</div>
                  <div className="text-text-tertiary text-xs tracking-wider uppercase">Director of Design</div>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8 rounded-sm relative border-gold/20 bg-surface/80"
            >
              <Icon icon="lucide:quote" className="absolute top-8 right-8 w-12 h-12 text-gold/10" />
              <p className="leading-relaxed mb-8 text-text-primary font-normal text-lg">
                &quot;I&apos;ve tried them all. This is the first time I feel calm looking at my todo list. The dark theme is perfection for late nights.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-sm flex items-center justify-center text-sm font-bold bg-surface border border-white/5 text-gold font-serif">MR</div>
                <div>
                  <div className="font-medium text-text-primary font-serif">Marcus R.</div>
                  <div className="text-text-tertiary text-xs tracking-wider uppercase">Senior Engineer</div>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card p-8 rounded-sm relative"
            >
              <Icon icon="lucide:quote" className="absolute top-8 right-8 w-12 h-12 text-gold/10" />
              <p className="leading-relaxed mb-8 text-text-secondary font-light text-lg">
                &quot;The project timeline view saved my last launch. Seeing everything laid out with such elegance made execution effortless.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-sm flex items-center justify-center text-sm font-bold bg-surface border border-white/5 text-gold font-serif">ET</div>
                <div>
                  <div className="font-medium text-text-primary font-serif">Emily T.</div>
                  <div className="text-text-tertiary text-xs tracking-wider uppercase">Founder</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-surface">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-3"
          >
            <div className="text-4xl md:text-5xl font-serif text-text-primary">10k+</div>
            <div className="text-gold text-xs font-medium tracking-[0.2em] uppercase">Members</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <div className="text-4xl md:text-5xl font-serif text-text-primary">500k</div>
            <div className="text-gold text-xs font-medium tracking-[0.2em] uppercase">Tasks Evolved</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <div className="text-4xl md:text-5xl font-serif text-text-primary">99%</div>
            <div className="text-gold text-xs font-medium tracking-[0.2em] uppercase">Efficiency</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <div className="text-4xl md:text-5xl font-serif text-text-primary">4.9</div>
            <div className="text-gold text-xs font-medium tracking-[0.2em] uppercase">Rating</div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-medium tracking-tight mb-2 text-text-primary">Frequently Asked</h2>
          <p className="text-text-tertiary font-light">Everything you need to know about Evolution of Todo.</p>
        </div>

        <div className="space-y-6">
          <details className="group glass-card rounded-sm">
            <summary className="flex items-center justify-between p-6 cursor-pointer font-medium transition-colors text-text-primary hover:text-gold">
              How do I organize my tasks by priority?
              <Icon icon="lucide:chevron-down" className="w-5 h-5 text-gold group-open:rotate-180 transition-transform duration-300" />
            </summary>
            <div className="px-6 pb-6 text-sm font-light leading-relaxed border-t pt-4 text-text-secondary border-white/5">
              When creating or editing a task, you can set priority levels (High, Medium, Low). Tasks are automatically grouped by priority on your dashboard, with urgent tasks highlighted at the top.
            </div>
          </details>

          <details className="group glass-card rounded-sm">
            <summary className="flex items-center justify-between p-6 cursor-pointer font-medium transition-colors text-text-primary hover:text-gold">
              Can I group tasks into projects?
              <Icon icon="lucide:chevron-down" className="w-5 h-5 text-gold group-open:rotate-180 transition-transform duration-300" />
            </summary>
            <div className="px-6 pb-6 text-sm font-light leading-relaxed border-t pt-4 text-text-secondary border-white/5">
              Yes! Use tags to categorize your tasks. The Projects page automatically groups all tasks by their tags, giving you a clear view of progress across different areas of your work.
            </div>
          </details>

          <details className="group glass-card rounded-sm">
            <summary className="flex items-center justify-between p-6 cursor-pointer font-medium transition-colors text-text-primary hover:text-gold">
              How does the Daily view work?
              <Icon icon="lucide:chevron-down" className="w-5 h-5 text-gold group-open:rotate-180 transition-transform duration-300" />
            </summary>
            <div className="px-6 pb-6 text-sm font-light leading-relaxed border-t pt-4 text-text-secondary border-white/5">
              The Daily view shows tasks due today along with your completion streak and productivity stats. It helps you build consistent habits by tracking your daily progress over time.
            </div>
          </details>

          <details className="group glass-card rounded-sm">
            <summary className="flex items-center justify-between p-6 cursor-pointer font-medium transition-colors text-text-primary hover:text-gold">
              What happens to completed tasks?
              <Icon icon="lucide:chevron-down" className="w-5 h-5 text-gold group-open:rotate-180 transition-transform duration-300" />
            </summary>
            <div className="px-6 pb-6 text-sm font-light leading-relaxed border-t pt-4 text-text-secondary border-white/5">
              Completed tasks are moved to the &quot;Completed&quot; section on your dashboard. They remain visible for your reference and contribute to your productivity statistics on the Profile page.
            </div>
          </details>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-void via-deep to-void" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-6xl font-serif font-medium tracking-tight text-text-primary">
              Ready to <span className="text-gradient-gold">Evolve</span>?
            </h2>
            <p className="text-xl text-text-secondary font-light max-w-2xl mx-auto">
              Join thousands of focused individuals who have transformed their productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-sm btn-gold font-semibold text-deep text-lg"
              >
                Start Free
                <Icon icon="lucide:arrow-right" className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-sm border border-white/10 text-text-primary hover:border-gold/30 hover:text-gold transition-all font-medium text-lg"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-deep pt-20 pb-10 border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-bright flex items-center justify-center shadow-gold">
                  <span className="font-serif font-bold text-lg text-void">ET</span>
                </div>
                <span className="font-serif font-bold text-xl tracking-tighter text-text-primary">Evolution of Todo</span>
              </div>
              <p className="text-text-tertiary text-sm mb-8 max-w-xs font-light leading-relaxed">
                Obsidian &amp; Gold Edition.<br />
                Crafted for the modern stoic.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-6 text-text-primary uppercase tracking-widest text-xs">Navigate</h4>
              <ul className="space-y-3 text-sm text-text-secondary font-light">
                <li><a href="#features" className="transition-colors hover:text-gold">Features</a></li>
                <li><a href="#how-it-works" className="transition-colors hover:text-gold">How It Works</a></li>
                <li><a href="#testimonials" className="transition-colors hover:text-gold">Testimonials</a></li>
                <li><a href="#faq" className="transition-colors hover:text-gold">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-6 text-text-primary uppercase tracking-widest text-xs">Account</h4>
              <ul className="space-y-3 text-sm text-text-secondary font-light">
                <li><Link href="/login" className="transition-colors hover:text-gold">Sign In</Link></li>
                <li><Link href="/register" className="transition-colors hover:text-gold">Create Account</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs border-white/5 text-text-tertiary font-light">
            <p>&copy; 2024 Evolution of Todo.</p>
            <p>Designed with precision.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
