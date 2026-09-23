interface TrainingExample {
  prompt: string;
  response: string;
  rating: number;
  topic: string;
  timestamp: string;
}

export class FineTuner {
  saveTrainingExample(prompt: string, response: string, rating: number, topic: string) {
    const examples: TrainingExample[] = JSON.parse(localStorage.getItem('rise_training_data') || '[]');
    examples.push({ prompt, response, rating, topic, timestamp: new Date().toISOString() });
    const trimmed = examples.slice(-500);
    localStorage.setItem('rise_training_data', JSON.stringify(trimmed));
  }

  getBestExamplesForTopic(topic: string, count: number = 3): TrainingExample[] {
    const examples: TrainingExample[] = JSON.parse(localStorage.getItem('rise_training_data') || '[]');
    return examples.filter(e => e.topic === topic && e.rating >= 4).slice(-count);
  }

  getFewShotExamples(topic: string): string {
    const examples = this.getBestExamplesForTopic(topic);
    if (examples.length === 0) return '';
    return `\nEXAMPLE RESPONSES YOU GAVE BEFORE THAT WERE HIGHLY RATED:\n` + examples.map(e => `User: ${e.prompt}\nRISE: ${e.response}`).join('\n\n');
  }

  exportTrainingData(): void {
    const data = localStorage.getItem('rise_training_data');
    const blob = new Blob([data || '[]'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rise_training_${Date.now()}.json`;
    a.click();
  }
}

export const fineTuner = new FineTuner();
