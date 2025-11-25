import { useMemo } from "react";

export const useAnalysisMessage = (plasticDetected: boolean | null) => {
  const positiveMessages = [
    "Nosso sistema detectou sinais claros de poluição plástica nesta região subaquática. Esses resíduos representam riscos significativos para diversas espécies marinhas.",
    "Foram identificados indícios de plástico na imagem analisada. A presença desse tipo de resíduo compromete a saúde dos ecossistemas oceânicos.",
    "A análise revelou possíveis fragmentos plásticos na água. Esses contaminantes podem afetar a fauna local e contribuir para a degradação do ambiente marinho."
  ];

  const negativeMessages = [
    "Nenhuma forma de poluição plástica foi identificada na imagem. Este cenário indica um ambiente marinho saudável e preservado.",
    "A análise não encontrou sinais de resíduos plásticos. Este tipo de resultado é fundamental para o monitoramento positivo dos oceanos.",
    "Não foram detectados fragmentos plásticos na área analisada. Isso sugere um ecossistema equilibrado e livre de contaminação visível."
  ];

  const message = useMemo(() => {
    if (plasticDetected === null) return "";

    const options = plasticDetected ? positiveMessages : negativeMessages;
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  }, [plasticDetected]);

  return message;
};
