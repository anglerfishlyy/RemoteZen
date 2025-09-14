"use client"

import React from 'react'
import { motion } from "framer-motion"
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ImageWithFallback } from './ImageWithFallback'
import { 
  Timer, 
  Users, 
  BarChart3, 
  CheckSquare, 
  Zap, 
  Shield, 
  Star,
  ArrowRight
} from 'lucide-react'

type NavigateFunction = (page: 'landing' | 'analytics' | 'login' | 'dashboard' | 'tasks' | 'timer' | 'profile') => void;

interface LandingPageProps {
  onNavigate: NavigateFunction;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const features = [
    {
      icon: CheckSquare,
      title: "Smart Task Management",
      description: "Organize, prioritize, and track your tasks with AI-powered insights and automated workflows."
    },
    {
      icon: Timer,
      title: "Focus Timer",
      description: "Boost productivity with Pomodoro technique and advanced focus tracking analytics."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Real-time collaboration with team chat, file sharing, and progress visualization."
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Detailed productivity analytics to optimize your workflow and team performance."
    },
    {
      icon: Zap,
      title: "Automation",
      description: "Automate repetitive tasks and create custom workflows to save time."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with end-to-end encryption and compliance standards."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F17] via-[#0F1419] to-[#0B0F17]">
      <motion.nav
  className="fixed top-0 left-1/2 transform -translate-x-1/2 w-[95%] max-w-6xl z-50 bg-black border border-black/20 rounded-xl shadow-2xl"
initial={{ y: -5 }}
animate={{ y: [0, 5, 0] }}
transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}

>
      {/* Floating Navigation */}
      <motion.nav
        className="fixed top-10 left-1/2 transform -translate-x-1/2 w-[95%] max-w-6xl z-50 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl"
        initial={{ y: -5 }}
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              RemoteZen
            </span>
          </motion.div>

          {/* Links */}
          <motion.div 
            className="hidden md:flex items-center space-x-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <a href="#features" className="relative text-gray-300 hover:text-white font-semibold group px-2 py-1 rounded-md">
              Features
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
            </a>
            <a href="#about" className="relative text-gray-300 hover:text-white font-semibold group px-2 py-1 rounded-md">
              About
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
            </a>
          </motion.div>

          {/* Buttons */}
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button 
              variant="ghost" 
              className="text-white px-4 py-2 rounded-lg hover:text-white hover:bg-white/10 transition-all duration-500"
              onClick={() => onNavigate('login')}
            >
              Sign In
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-500"
              onClick={() => onNavigate('login')}
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-2" />
            </Button>
          </motion.div>
        </div>
      </motion.nav>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="container mx-auto text-center">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-4xl mx-auto relative z-10"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30">
                <Star className="w-3 h-3 mr-1" />
                Remote work, reimagined
              </Badge>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight"
            >
              All-in-one productivity hub for remote teams
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Streamline your workflow with smart task management, focus timers, and real-time collaboration. 
              Built for teams who want to work better, not harder.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10"
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-8 py-3 text-lg group relative z-10 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                onClick={() => onNavigate('login')}
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 relative"
          >
            <div className="relative mx-auto max-w-4xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl rounded-full" />
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800"
                alt="Dashboard Preview"
                className="relative z-10 w-full rounded-2xl border border-white/10 shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Everything you need to stay productive
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to help remote teams collaborate effectively and boost productivity
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-black/40 backdrop-blur-xl border-white/10 h-full hover:border-white/20 transition-all duration-300 group">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">RemoteZen</span>
            </div>
            <p className="text-gray-400">© 2025 RemoteZen. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
