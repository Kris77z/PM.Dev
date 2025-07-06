import { cn } from "@/lib/utils";
import { 
  IconBrain,
  IconBook
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export function PMFeatures() {
  const router = useRouter();

  const features = [
    // 隐藏这两个卡片
    // {
    //   title: "优化已有功能/页面",
    //   description: "针对现有产品功能进行优化，提升用户体验和性能",
    //   icon: <IconSettings size={24} />,
    //   onClick: () => onSelect('optimize')
    // },
    // {
    //   title: "开发全新产品",
    //   description: "从零开始构思和规划一个全新的产品",
    //   icon: <IconFlame size={24} />,
    //   onClick: () => onSelect('newProduct')
    // },
    {
      title: "Vibe Coding 指南",
      description: "更适合 PM 体质的 Vibe Coding 指南",
      icon: <IconBook size={24} />,
      onClick: () => router.push('/vibe-coding')
    },
    {
      title: "PM.DEV Hub",
      description: "日常需求需要用到的一些工具",
      icon: <IconBrain size={24} />,
      onClick: () => router.push('/ask-anything')
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 py-6 max-w-4xl mx-auto">
      {features.map((feature) => (
        <Feature key={feature.title} {...feature} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  onClick
}: FeatureProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col p-6 relative group/feature border border-gray-300 rounded-lg hover:border-black transition-all cursor-pointer h-full"
      )}
    >
      <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-orange-50 to-transparent pointer-events-none rounded-lg" />
      
      <div className="mb-4 relative z-10 text-orange-500">
        {icon}
      </div>
      
      <div className="text-lg font-bold mb-2 relative z-10 group-hover/feature:text-orange-600 transition-colors">
        <div className="absolute left-0 top-2 h-0 group-hover/feature:h-5 w-1 rounded-full bg-orange-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block">
          {title}
        </span>
      </div>
      
      <p className="text-sm text-neutral-600 max-w-xs relative z-10">
        {description}
      </p>
    </div>
  );
}; 