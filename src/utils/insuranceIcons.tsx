import React from 'react';
import {
  Car,
  Home,
  HeartPulse,
  Users,
  Plane,
  Briefcase,
  HardHat,
  Droplets,
  AlertOctagon,
  Activity,
  KeyRound,
  Flame,
  CloudLightning,
  UserX,
  Building2,
  Wrench,
  Stethoscope,
  FileQuestion,
  MapPin,
  Compass,
  Navigation,
  Sun,
  Globe,
  Gauge,
  Calendar,
  Radio,
  Laptop,
  Landmark,
  PhoneCall,
  UserCheck,
  CheckCircle2,
  Info,
  AlertTriangle,
  Zap,
  Clock,
  ShieldAlert,
  FileSearch,
  CheckCheck,
  XCircle,
  HelpCircle,
  Cpu,
  Trees,
  Boxes,
  Grid,
  TrendingUp,
  Scale,
  SlidersHorizontal,
  LucideProps
} from 'lucide-react';

/**
 * Returns a dedicated icon component and styling for any Policy Category
 */
export function getPolicyCategoryIcon(category?: string, props?: LucideProps) {
  const norm = (category || '').toLowerCase();
  if (norm.includes('veh') || norm.includes('auto')) {
    return <Car {...props} />;
  }
  if (norm.includes('prop') || norm.includes('home')) {
    return <Home {...props} />;
  }
  if (norm.includes('health') || norm.includes('inpatient')) {
    return <HeartPulse {...props} />;
  }
  if (norm.includes('life')) {
    return <Users {...props} />;
  }
  if (norm.includes('travel')) {
    return <Plane {...props} />;
  }
  if (norm.includes('work') || norm.includes('comp')) {
    return <HardHat {...props} />;
  }
  if (norm.includes('comm') || norm.includes('liab')) {
    return <Briefcase {...props} />;
  }
  return <Building2 {...props} />;
}

/**
 * Returns a dedicated icon component and styling for any Claim / Incident Type
 */
export function getClaimTypeIcon(claimType?: string, props?: LucideProps) {
  const norm = (claimType || '').toLowerCase();
  if (norm.includes('collis')) {
    return <Car {...props} />;
  }
  if (norm.includes('water') || norm.includes('flood') || norm.includes('pipe')) {
    return <Droplets {...props} />;
  }
  if (norm.includes('hit and run') || norm.includes('hit-and-run')) {
    return <AlertOctagon {...props} />;
  }
  if (norm.includes('injury') || norm.includes('contusion') || norm.includes('wound')) {
    return <Activity {...props} />;
  }
  if (norm.includes('theft') || norm.includes('burglar') || norm.includes('stolen')) {
    return <KeyRound {...props} />;
  }
  if (norm.includes('fire') || norm.includes('arson') || norm.includes('burn')) {
    return <Flame {...props} />;
  }
  if (norm.includes('storm') || norm.includes('hail') || norm.includes('wind') || norm.includes('lightning')) {
    return <CloudLightning {...props} />;
  }
  if (norm.includes('slip') || norm.includes('fall')) {
    return <UserX {...props} />;
  }
  if (norm.includes('breakdown') || norm.includes('equip') || norm.includes('boiler')) {
    return <Wrench {...props} />;
  }
  if (norm.includes('hospital') || norm.includes('surger') || norm.includes('medical')) {
    return <Stethoscope {...props} />;
  }
  if (norm.includes('struct') || norm.includes('roof') || norm.includes('wall')) {
    return <Building2 {...props} />;
  }
  return <FileQuestion {...props} />;
}

/**
 * Returns a dedicated icon for Region
 */
export function getRegionIcon(region?: string, props?: LucideProps) {
  const norm = (region || '').toLowerCase();
  if (norm.includes('north')) return <Compass {...props} />;
  if (norm.includes('south')) return <MapPin {...props} />;
  if (norm.includes('east')) return <Navigation {...props} />;
  if (norm.includes('west')) return <Sun {...props} />;
  return <Globe {...props} />;
}

/**
 * Returns a dedicated icon for Submission Channel
 */
export function getChannelIcon(channel?: string, props?: LucideProps) {
  const norm = (channel || '').toLowerCase();
  if (norm.includes('online')) return <Laptop {...props} />;
  if (norm.includes('agent')) return <UserCheck {...props} />;
  if (norm.includes('branch')) return <Landmark {...props} />;
  if (norm.includes('call') || norm.includes('phone')) return <PhoneCall {...props} />;
  return <Radio {...props} />;
}

/**
 * Returns a dedicated icon for Severity Category
 */
export function getSeverityIcon(severity?: string, props?: LucideProps) {
  const norm = (severity || '').toLowerCase();
  if (norm.includes('minor')) return <CheckCircle2 {...props} />;
  if (norm.includes('moderat')) return <Info {...props} />;
  if (norm.includes('major')) return <AlertTriangle {...props} />;
  if (norm.includes('catastroph') || norm.includes('severe')) return <AlertOctagon {...props} />;
  return <Gauge {...props} />;
}

/**
 * Returns a dedicated icon for Risk Tier
 */
export function getRiskTierIcon(tier?: string, props?: LucideProps) {
  const norm = (tier || '').toLowerCase();
  if (norm.includes('low')) return <CheckCircle2 {...props} />;
  if (norm.includes('moderate')) return <Info {...props} />;
  if (norm.includes('elevated')) return <AlertTriangle {...props} />;
  if (norm.includes('critical')) return <AlertOctagon {...props} />;
  return <Gauge {...props} />;
}

/**
 * Returns a dedicated icon for Claim Status
 */
export function getStatusIcon(status?: string, props?: LucideProps) {
  const norm = (status || '').toLowerCase();
  if (norm.includes('fast-track')) return <Zap {...props} />;
  if (norm.includes('siu')) return <ShieldAlert {...props} />;
  if (norm.includes('document')) return <FileSearch {...props} />;
  if (norm.includes('settled')) return <CheckCheck {...props} />;
  if (norm.includes('denied')) return <XCircle {...props} />;
  if (norm.includes('standard') || norm.includes('review')) return <Clock {...props} />;
  return <HelpCircle {...props} />;
}
