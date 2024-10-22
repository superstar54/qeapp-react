import React from 'react';
import BaseCodeResourcesTab from '../../widgets/CodeResourcesTab';

const codesConfig = {
  projwfc: {
    label: 'qe-7.2-projwfc@localhost',
    input_plugin: "quantumespresso.projwfc",
    nodes: 1,
    cpus: 1,
    codeOptions: [],
  },
  dos: {
    label: 'qe-7.2-dos@localhost',
    input_plugin: "quantumespresso.dos",
    nodes: 1,
    cpus: 1,
    codeOptions: [],
  },
  // Add more default codes here if necessary
};

const CodeResourcesTab = (props) => {
  return <BaseCodeResourcesTab codesConfig={codesConfig} {...props} />;
};

export default CodeResourcesTab;
