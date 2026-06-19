import React from 'react';
import {
  Compass,
  Atom,
  Hourglass,
  Film,
  Cpu,
  Globe,
  Music,
  Trophy,
  Sparkles,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Heart,
  User,
  Shield,
  Search,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Plus,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';

const iconMap: { [key: string]: React.ElementType } = {
  Compass,
  Atom,
  Hourglass,
  Film,
  Cpu,
  Globe,
  Music,
  Trophy,
  Sparkles,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Heart,
  User,
  Shield,
  Search,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Plus,
  Play,
  Volume2,
  VolumeX,
};

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const LucideIcon: React.FC<LucideIconProps> = ({ name, className = '', size }) => {
  const IconComponent = iconMap[name] || Sparkles; // Default to Sparkles if not found
  return <IconComponent className={className} size={size} />;
};
