export interface LandingDomainItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  sampleTopic: string;
}

export interface LandingWorkflowStep {
  step: number;
  title: string;
  shortDesc: string;
  fullDesc: string;
  actionText?: string;
  iconName: string;
}
