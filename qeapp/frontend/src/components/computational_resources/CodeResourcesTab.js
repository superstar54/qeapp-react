import React from 'react';
import BaseCodeResourcesTab from '../widgets/CodeResourcesTab';

const codesConfig = {
  pw: {
    label: 'qe-7.2-pw@localhost',
    nodes: 1,
    cpus: 1,
    codeOptions: ['qe-7.2-pw@localhost', 'qe-7.1-pw@remote'],
  },
  // Add more default codes here if necessary
};

const CodeResourcesTab = (props) => {
  return <BaseCodeResourcesTab codesConfig={codesConfig} {...props} />;
};

export default CodeResourcesTab;
