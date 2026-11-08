/* Paper Tables 1-5 and 22-26. Rates retain the published rounding. */
window.SCDBENCH_RESULTS = {
  models: [
    { name: 'Claude Opus 4.7', short: 'Opus 4.7', color: '#b8614d' },
    { name: 'GPT-5.3-Codex', short: 'GPT-5.3-Codex', color: '#3966aa' },
    { name: 'GLM-5', short: 'GLM-5', color: '#26866a' },
    { name: 'GLM-5 (instruct)', short: 'GLM-5 (instruct)', color: '#75827c' }
  ],
  // Row order: format %, compilation %, ABI F1, semantic %, perfect count.
  samples: {
    original: {
      label: 'Original sample', contracts: 600, functions: 14553, checkpoints: 227383,
      initial: [[72.5,56.8,.615,22.5,33],[94,70.2,.766,19.6,33],[86.7,36.8,.428,9.9,14],[90,24,.287,5.8,4]],
      repaired: [[72.5,69.2,.721,29.4,42],[94,90.3,.896,28,41],[86.7,67.2,.697,20.7,18],[90,64.3,.658,17.7,6]],
      strata: {
        easy: {
          label: 'Easy', contracts: 200, functions: 2226,
          initial: [[83.5,74.5,.803,38.9,25],[98,81,.868,32.9,30],[84.5,55,.677,23.9,14],[90,37,.517,15.3,4]],
          repaired: [[83.5,82,.832,42,33],[98,96.5,.942,37.8,37],[84.5,76,.798,33.2,17],[90,76.5,.793,29.4,6]]
        },
        medium: {
          label: 'Medium', contracts: 200, functions: 4774,
          initial: [[71.5,56.5,.680,24.3,6],[93,71,.823,19.8,3],[88.5,33.5,.491,11.8,0],[92.5,25,.335,6.6,0]],
          repaired: [[71.5,70,.774,31.9,7],[93,89,.928,27.9,4],[88.5,68.5,.759,24.5,1],[92.5,66,.704,18.9,0]]
        },
        hard: {
          label: 'Hard', contracts: 200, functions: 7553,
          initial: [[62.5,39.5,.500,16.5,2],[91,58.5,.691,15.6,0],[87,22,.289,4.6,0],[87.5,10,.168,2.4,0]],
          repaired: [[62.5,55.5,.649,24.2,2],[91,85.5,.861,25.2,0],[87,57,.623,14.6,0],[87.5,50.5,.578,13.4,0]]
        }
      }
    },
    second: {
      label: 'Second sample', contracts: 600, functions: 14578, checkpoints: 226138,
      initial: [[75.8,58.3,.630,23.3,31],[99.2,68.5,.757,20.3,30],[61.8,29.5,.363,8.7,11],[87.7,24.5,.288,5.3,1]],
      repaired: [[75.8,73,.756,32,36],[99.2,93.3,.917,30,36],[61.8,48,.556,15.4,16],[87.7,59.8,.618,14.7,3]],
      strata: {
        easy: {
          label: 'Easy', contracts: 200, functions: 2261,
          initial: [[90,79.5,.841,35.8,22],[99,75.5,.855,28.9,26],[58,40.5,.534,15.3,10],[92,40,.520,13.5,1]],
          repaired: [[90,88,.879,39.3,25],[99,93.5,.950,36.4,30],[58,52,.617,19.5,13],[92,78.5,.801,27,3]]
        },
        medium: {
          label: 'Medium', contracts: 200, functions: 4623,
          initial: [[73,57,.689,29.5,8],[99.5,68,.770,19.2,4],[60,27,.398,11.1,1],[89,20,.297,4.8,0]],
          repaired: [[73,71.5,.795,37.3,10],[99.5,95,.946,31.4,6],[60,47.5,.599,19,2],[89,58.5,.658,15.6,0]]
        },
        hard: {
          label: 'Hard', contracts: 200, functions: 7694,
          initial: [[64.5,38.5,.509,15.8,1],[99,62,.718,18.4,0],[67.5,21,.283,5.4,0],[82,13.5,.202,3.1,0]],
          repaired: [[64.5,59.5,.688,26.6,1],[99,91.5,.888,27.2,0],[67.5,44.5,.510,12.1,1],[82,42.5,.524,10.5,0]]
        }
      }
    }
  }
};

for (const sample of Object.values(window.SCDBENCH_RESULTS.samples)) {
  sample.strata = {
    all: {
      label: 'All contracts', contracts: sample.contracts, functions: sample.functions,
      initial: sample.initial, repaired: sample.repaired
    },
    ...sample.strata
  };
}
