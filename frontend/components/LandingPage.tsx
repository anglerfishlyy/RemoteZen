"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { 
  CheckCircle2, 
  Timer, 
  Users, 
  BarChart3, 
  Zap, 
  Focus,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Layout,
  Brain,
  Target
} from 'lucide-react'
import { Span } from 'next/dist/trace';

type NavigateFunction = (page: string) => void;

interface LandingPageProps {
  onNavigate: NavigateFunction;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);
  const storyRef = useRef(null);
  const isStoryInView = useInView(storyRef, { once: false, amount: 0.3 });
  
  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ["start end", "end start"]
  });
  

  const chaosOpacity = useTransform(scrollYProgress, [0, 0.3, 0.5], [0, 1, 0]);
  const mergeScale = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [1, 0.3, 0]);
  const calmOpacity = useTransform(scrollYProgress, [0.6, 0.8], [0, 1]);
  const [sliderPosition, setSliderPosition] = useState(50);

const handleDrag = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  const container = e.currentTarget.parentElement;
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const updatePosition = (clientX: number) => {
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleMove = (event: MouseEvent) => updatePosition(event.clientX);
  const handleUp = () => {
    document.removeEventListener("mousemove", handleMove);
    document.removeEventListener("mouseup", handleUp);
  };

  document.addEventListener("mousemove", handleMove);
  document.addEventListener("mouseup", handleUp);
};


  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Layout,
      title: "Unified Workspace",
      description: "All your tools, tasks, and communication in one beautiful interface. No more tab switching."
    },
    {
      icon: Timer,
      title: "Focus Timer",
      description: "Built-in Pomodoro technique with deep work sessions. Track your most productive hours."
    },
    {
      icon: Users,
      title: "Team Sync",
      description: "Real-time collaboration without the noise. Stay connected, not distracted."
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "Understand your productivity patterns. Make data-driven decisions about your work."
    },
    {
      icon: Brain,
      title: "Intelligent Automation",
      description: "Automate repetitive workflows. Let AI handle the mundane so you can focus on what matters."
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set objectives and track progress. Visual dashboards keep your team aligned."
    }
  ];

  const testimonials = [
    {
      quote: "RemoteZen transformed how our distributed team works. We're 40% more productive and actually enjoying the process.",
      author: "Sarah Chen",
      role: "Head of Product, Velocity",
      avatar: "SC"
    },
    {
      quote: "Finally, a tool that understands remote work isn't just office work from home. It's a different way of thinking.",
      author: "Marcus Rodriguez",
      role: "CEO, Streamline",
      avatar: "MR"
    },
    {
      quote: "The focus timer alone justified the switch. But the unified workspace? That's what kept us.",
      author: "Aisha Patel",
      role: "Engineering Lead, Flux",
      avatar: "AP"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1C1917]">
      {/* Navigation */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 50 ? 'bg-[#FAFAF9]/80 backdrop-blur-xl border-b border-[#18110d]' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-[#1b120d] rounded-md flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#FAFAF9]" strokeWidth={2} />
              </div>
              <span className="text-lg font-semibold tracking-tight cursor-pointer text-[#807e6f] hover:text-[#1C1917] transition-colors">
                RemoteZen
              </span>
            </div>

            {/* Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-[#57534E] hover:text-[#1C1917] transition-colors">
                Features
              </a>
              <a href="#why" className="text-sm font-medium cursor-pointer text-[#57534E] hover:text-[#1C1917] transition-colors">
                Why RemoteZen
              </a>
              <a href="#testimonials" className="text-sm font-medium cursor-pointer text-[#57534E] hover:text-[#1C1917] transition-colors">
                Testimonials
              </a>
              <button 
                onClick={() => onNavigate('login')}
                className="text-sm font-medium cursor-pointer text-[#57534E] hover:text-[#1C1917] transition-colors"
              >
                Login
              </button>
            </div>

            {/* CTA */}
            <button
              onClick={() => onNavigate('login')}
              className="group inline-flex items-center cursor-pointer px-4 py-2 text-sm font-medium text-[#FAFAF9] bg-[#1C1917] rounded-lg hover:bg-[#292524] transition-all duration-200"
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center space-x-2 px-3 py-1 bg-[#F5F5F4] border border-[#E7E5E4] rounded-full mb-8"
            >
              <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
              <span className="text-xs font-medium text-[#57534E]">Now available for remote teams</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#1C1917] mb-6 leading-[1.1]">
              All-in-one workspace
              <br />
              <span className="text-[#57534E]">for remote teams</span>
            </h1>

            <p className="text-lg md:text-xl text-[#78716C] mb-10 max-w-2xl mx-auto leading-relaxed">
              Stop juggling tools. RemoteZen brings tasks, timers, and team collaboration into one calm, focused workspace.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => onNavigate('login')}
                className="group inline-flex cursor-pointer items-center px-6 py-3 text-base font-medium text-[#FAFAF9] bg-[#1C1917] rounded-lg hover:bg-[#292524] transition-all duration-200 shadow-sm"
              >
                Start for free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
              </button>
              <button className="inline-flex cursor-pointer items-center px-6 py-3 text-base font-medium text-[#1C1917] bg-transparent border border-[#E7E5E4] rounded-lg hover:bg-[#F5F5F4] transition-all duration-200">
                View demo
              </button>
            </div>
          </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mt-20 relative"
      >
        <div className="relative mx-auto max-w-5xl">
          <div className="absolute -inset-4 bg-gradient-to-b from-[#E7E5E4]/40 to-transparent blur-3xl rounded-3xl" />

          <div className="relative bg-white border border-[#E7E5E4] rounded-2xl shadow-2xl shadow-[#A8A29E]/10 overflow-hidden">
            
            {/* Window Top Bar */}
            <div className="bg-[#F5F5F4] px-4 py-3 border-b border-[#E7E5E4] flex items-center space-x-2">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 bg-[#DC2626] rounded-full" />
                <div className="w-3 h-3 bg-[#F59E0B] rounded-full" />
                <div className="w-3 h-3 bg-[#10B981] rounded-full" />
              </div>
            </div>

            <div className="p-0 bg-[#FAFAF9]">
              <img 
                src="/main.png" 
                alt="Dashboard preview" 
                className="w-full h-auto rounded-b-2xl"
              />
            </div>
          </div>
        </div>
      </motion.div>
      </div>
      </section>

      <section ref={storyRef} className="py-32 px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="min-h-[80vh] flex items-center justify-center relative">
            {/* Chaos State */}
            <motion.div
              style={{ opacity: chaosOpacity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div className="relative w-full max-w-2xl mx-auto h-80">
                  <motion.div
                    animate={isStoryInView ? { x: [-20, 20, -20], rotate: [-2, 2, -2] } : {}}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 left-10 w-40 h-32 bg-[#EF4444]/20 backdrop-blur-sm border border-[#EF4444]/30 rounded-lg p-3"
                  >
                    <div className="text-xs font-medium text-[#57534E] mb-2">Trello</div>
                    <div className="space-y-1">
                      <div className="h-2 bg-[#EF4444]/40 rounded" />
                      <div className="h-2 bg-[#EF4444]/40 rounded w-3/4" />
                    </div>
                  </motion.div>
                  <motion.div
                    animate={isStoryInView ? { x: [20, -20, 20], rotate: [3, -3, 3] } : {}}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-12 right-10 w-40 h-32 bg-[#3B82F6]/20 backdrop-blur-sm border border-[#3B82F6]/30 rounded-lg p-3"
                  >
                    <div className="text-xs font-medium text-[#57534E] mb-2">Slack</div>
                    <div className="space-y-1">
                      <div className="h-2 bg-[#3B82F6]/40 rounded w-2/3" />
                      <div className="h-2 bg-[#3B82F6]/40 rounded" />
                    </div>
                  </motion.div>
                  <motion.div
                    animate={isStoryInView ? { y: [10, -10, 10], rotate: [-3, 3, -3] } : {}}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-0 left-20 w-40 h-32 bg-[#8B5CF6]/20 backdrop-blur-sm border border-[#8B5CF6]/30 rounded-lg p-3"
                  >
                    <div className="text-xs font-medium text-[#57534E] mb-2">Notion</div>
                    <div className="space-y-1">
                      <div className="h-2 bg-[#8B5CF6]/40 rounded" />
                      <div className="h-2 bg-[#8B5CF6]/40 rounded w-4/5" />
                    </div>
                  </motion.div>
                  <motion.div
                    animate={isStoryInView ? { y: [-10, 10, -10], x: [10, -10, 10] } : {}}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-10 right-20 w-40 h-32 bg-[#F59E0B]/20 backdrop-blur-sm border border-[#F59E0B]/30 rounded-lg p-3"
                  >
                    <div className="text-xs font-medium text-[#57534E] mb-2">Calendar</div>
                    <div className="space-y-1">
                      <div className="h-2 bg-[#F59E0B]/40 rounded w-3/5" />
                      <div className="h-2 bg-[#F59E0B]/40 rounded" />
                    </div>
                  </motion.div>
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#1C1917] mt-8 mb-4">
                  Too many tools.
                </h2>
                <p className="text-lg text-[#78716C]">Too much switching. Too much chaos.</p>
              </div>
            </motion.div>

            {/* Merge State */}
            <motion.div
              style={{ scale: mergeScale, opacity: mergeScale }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-64 h-64 bg-[#A8A29E]/30 backdrop-blur-xl rounded-full" />
            </motion.div>

            {/* Calm State */}
            <motion.div
              style={{ opacity: calmOpacity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center">
                <div className="bg-white border border-[#E7E5E4] rounded-2xl shadow-2xl shadow-[#A8A29E]/10 p-8 max-w-md mx-auto">
                  <div className="w-12 h-12 bg-[#1C1917] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-[#FAFAF9]" strokeWidth={2} />
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-[#10B981]" strokeWidth={2} />
                      <div className="h-3 bg-[#F5F5F4] rounded flex-1" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-[#10B981]" strokeWidth={2} />
                      <div className="h-3 bg-[#F5F5F4] rounded flex-1" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-[#E7E5E4] rounded" />
                      <div className="h-3 bg-[#F5F5F4] rounded flex-1" />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-[#57534E]">RemoteZen</div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#1C1917] mt-8 mb-4">
                  One clean space.
                </h2>
                <p className="text-lg text-[#78716C]">No chaos. Just focus.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Before/After Slider */}
<section className="py-20 px-6 lg:px-8 bg-[#F5F5F4]">
  <div className="max-w-5xl mx-auto">
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-[#1C1917] mb-4">
        See the difference
      </h2>
      <p className="text-lg text-[#78716C]">
        Drag to compare your old workflow with RemoteZen
      </p>
    </div>

    <div className="relative h-96 bg-white border border-[#E7E5E4] rounded-2xl overflow-hidden shadow-lg">

      {/* BEFORE */}
      <img 
        src="/before.png"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* AFTER */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img 
          src="/main.png"
          className="w-full h-full object-cover"
        />
      </div>

      {/* SLIDER */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-[#1C1917] cursor-ew-resize z-20"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleDrag}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-10 h-10 bg-[#1C1917] rounded-full border-4 border-white shadow-lg flex items-center justify-center">
          <div className="flex space-x-0.5">
            <div className="w-0.5 h-4 bg-white rounded" />
            <div className="w-0.5 h-4 bg-white rounded" />
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#1C1917] mb-4">
              Everything you need, nothing you don't
            </h2>
            <p className="text-lg text-[#78716C] max-w-2xl mx-auto">
              Powerful features designed for remote teams who value simplicity and focus
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl p-6 h-full hover:border-[#D6D3D1] hover:shadow-lg hover:shadow-[#A8A29E]/5 transition-all duration-300">
                  <div className="w-11 h-11 bg-[#F5F5F4] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#1C1917] transition-colors duration-300">
                    <feature.icon className="w-5 h-5 text-[#57534E] group-hover:text-white transition-colors duration-300" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1C1917] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[#78716C] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why RemoteZen */}
      <section id="why" className="py-20 px-6 lg:px-8 bg-[#F5F5F4]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#1C1917] mb-4">
              Why RemoteZen?
            </h2>
            <p className="text-lg text-[#78716C]">
              Built for the way remote teams actually work
            </p>
          </div>

          <div className="space-y-20">
            {/* Unified Workspace */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white border border-[#E7E5E4] rounded-full mb-4">
                  <Layout className="w-4 h-4 text-[#57534E]" strokeWidth={2} />
                  <span className="text-sm font-medium text-[#57534E]">Unified Workspace</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-[#1C1917] mb-4">
                  Stop switching between tools
                </h3>
                <p className="text-lg text-[#78716C] mb-6 leading-relaxed">
                  Tasks, timers, docs, and team chat in one place. No more context switching. No more lost productivity. Just seamless work.
                </p>
                <ul className="space-y-3">
                  {["Unified task management", "Integrated communication", "Focus Timers"].map((item, i) => (
                    <li key={i} className="flex items-center space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0" strokeWidth={2} />
                      <span className="text-[#57534E]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-[#E7E5E4] rounded-2xl p-8 shadow-lg">
                <img 
    src="/main.png"
    alt="Unified Workspace UI"
    className="rounded-xl w-full"
  />
              </div>
            </div>

            {/* Intelligent Automation */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              <div className="order-2 lg:order-1 bg-white border border-[#E7E5E4] rounded-2xl p-8 shadow-lg">
                
                <div className="flex items-center space-x-4 mb-6">
                  
                  <div className="w-12 h-12 bg-[#1C1917] rounded-lg flex items-center justify-center">
                    
                    <span> <Brain className="w-6 h-6 text-white" strokeWidth={2} /></span>
                  </div>
                  <div className="flex-1">
                    
                    <h2 className="text-2xl md:text-3xl font-bold text-[#1C1917] mb-4" >coming soon</h2>
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-[#FAFAF9] rounded-lg">
                      <div className="w-2 h-2 bg-[#10B981] rounded-full" />
                      <div className="h-2 bg-[#E7E5E4] rounded flex-1" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 lg:order-2">
               
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white border border-[#E7E5E4] rounded-full mb-4" >
                  <><Brain className="w-4 h-4 text-[#57534E]" strokeWidth={2} />
                   </>
                  <span className="text-sm font-medium text-[#57534E]">Intelligent Automation</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-[#1C1917] mb-4">
                  Let AI handle the mundane
                </h3>
                <p className="text-lg text-[#78716C] mb-6 leading-relaxed">
                  Automate repetitive workflows and let smart suggestions guide your work. Focus on what matters while RemoteZen handles the rest.
                </p>
                <ul className="space-y-3">
                  {["Smart task prioritization", "Automated workflows", "Intelligent scheduling"].map((item, i) => (
                    <li key={i} className="flex items-center space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0" strokeWidth={2} />
                      <span className="text-[#57534E]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Focus Systems */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white border border-[#E7E5E4] rounded-full mb-4">
                  <Focus className="w-4 h-4 text-[#57534E]" strokeWidth={2} />
                  <span className="text-sm font-medium text-[#57534E]">Focus Systems</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-[#1C1917] mb-4">
                  Deep work, built in
                </h3>
                <p className="text-lg text-[#78716C] mb-6 leading-relaxed">
                  Pomodoro timers, distraction blocking, and focus analytics help you get into flow and stay there. Track your most productive hours.
                </p>
                <ul className="space-y-3">
                  {["Built-in focus timer", "Distraction management", "Productivity insights"].map((item, i) => (
                    <li key={i} className="flex items-center space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0" strokeWidth={2} />
                      <span className="text-[#57534E]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-[#E7E5E4] rounded-2xl p-8 shadow-lg">
                
                   <img 
                    src="/focus.png"
                    alt="Automation Dashboard"
                    className="rounded-xl w-full"
                  />
                           
              </div>
            </div>

            {/* Analytics */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 bg-white border border-[#E7E5E4] rounded-2xl p-8 shadow-lg">
                 <img 
                  src="/analytics.png"
                  alt="Automation Dashboard"
                  className="rounded-xl w-full"
                />             
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white border border-[#E7E5E4] rounded-full mb-4">
                  <BarChart3 className="w-4 h-4 text-[#57534E]" strokeWidth={2} />
                  <span className="text-sm font-medium text-[#57534E]">Analytics for Remote Teams</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-[#1C1917] mb-4">
                  Understand your patterns
                </h3>
                <p className="text-lg text-[#78716C] mb-6 leading-relaxed">
                  Detailed analytics show when you're most productive, where time goes, and how to optimize your workflow. Data-driven decisions, not guesswork.
                </p>
                <ul className="space-y-3">
                  {["Productivity tracking", "Team performance metrics", "Time allocation insights"].map((item, i) => (
                    <li key={i} className="flex items-center space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0" strokeWidth={2} />
                      <span className="text-[#57534E]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#1C1917] mb-4">
              Loved by remote teams
            </h2>
            <p className="text-lg text-[#78716C]">
              Join thousands of teams working better with RemoteZen
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl p-6 hover:shadow-lg hover:shadow-[#A8A29E]/5 transition-all duration-300"
              >
                <p className="text-[#57534E] mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#1C1917] rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#1C1917]">
                      {testimonial.author}
                    </div>
                    <div className="text-xs text-[#78716C]">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 bg-[#1C1917]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Start working better today
            </h2>
            <p className="text-lg text-[#A8A29E] mb-10 max-w-2xl mx-auto">
              Join thousands of remote teams who've transformed their workflow. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => onNavigate('login')}
                className="group inline-flex cursor-pointer items-center px-8 py-4 text-base font-medium text-[#1C1917] bg-white rounded-lg hover:bg-[#F5F5F4] transition-all duration-200 shadow-lg"
              >
                Get started for free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
              </button>
              <button className="inline-flex cursor-pointer items-center px-8 py-4 text-base font-medium text-white bg-transparent border border-white/20 rounded-lg hover:bg-white/10 transition-all duration-200">
                Schedule a demo
              </button>
            </div>
            <p className="mt-6 text-sm text-[#78716C]">
              Free 14-day trial • No credit card required • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-8 bg-[#FAFAF9] border-t border-[#E7E5E4]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-7 h-7 bg-[#1C1917] rounded-md flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <span className="text-lg font-semibold text-[#1C1917]">RemoteZen</span>
              </div>
              <p className="text-sm text-[#78716C]">
                The all-in-one workspace for remote teams who value simplicity.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#1C1917] mb-3">Product</h4>
              <ul className="space-y-2">
                {['Features', 'Pricing', 'Security', 'Roadmap'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-[#78716C] hover:text-[#1C1917] transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#1C1917] mb-3">Company</h4>
              <ul className="space-y-2">
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-[#78716C] hover:text-[#1C1917] transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#1C1917] mb-3">Resources</h4>
              <ul className="space-y-2">
                {['Documentation', 'Help Center', 'API', 'Community'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-[#78716C] hover:text-[#1C1917] transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[#E7E5E4] flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-[#78716C]">
              © 2025 RemoteZen. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {['Privacy', 'Terms', 'Cookies'].map((item) => (
                <a key={item} href="#" className="text-sm text-[#78716C] hover:text-[#1C1917] transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}