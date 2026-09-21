export const generateQuestions = async (params: {
  subject: string;
  classLevel: string;
  topic: string;
  count: number;
  type: 'mcq' | 'written' | 'creative';
}) => {
  const response = await fetch("/api/questions/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "প্রশ্ন তৈরি করতে সমস্যা হয়েছে।");
  }

  const data = await response.json();
  return data.questions || [];
};

export const evaluateAnswer = async (question: string, userAnswer: string, correctAnswer: string) => {
  const response = await fetch("/api/questions/evaluate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question, userAnswer, correctAnswer }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "উত্তর মূল্যায়ন করতে সমস্যা হয়েছে।");
  }

  const data = await response.json();
  return data.evaluation || { score: 0, feedback: "" };
};

