import { LearnWorkspace } from '@/components/learn-workspace';
import { CodePracticeWorkspace } from '@/components/code-practice-workspace';

export const dynamic = 'force-dynamic';

export default function LearnPage() {
  return (
    <div className="space-y-8">
      <LearnWorkspace />
      <CodePracticeWorkspace />
    </div>
  );
}
