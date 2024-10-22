// src/components/plugins/CodeResourcesTab.js
import React, { useEffect } from 'react';
import { Form } from 'react-bootstrap';
import CodeSelector from './CodeSelector';

const CodeResourcesTab = ({ codesConfig = {}, data = {}, onDataChange }) => {

  useEffect(() => {
    // Initialize codes with defaults and existing data
    const initialCodes = { ...codesConfig, ...data.codes };

    // Merge default properties for each code
    Object.keys(codesConfig).forEach((codeKey) => {
      if (!initialCodes[codeKey]) {
        initialCodes[codeKey] = { ...codesConfig[codeKey] };
      } else {
        initialCodes[codeKey] = {
          ...codesConfig[codeKey],
          ...initialCodes[codeKey],
          codeOptions: codesConfig[codeKey].codeOptions, // Ensure codeOptions are present
        };
      }
    });

    // Update data if initialCodes differ from current data.codes
    const newData = { ...data, codes: initialCodes };
    if (JSON.stringify(data.codes || {}) !== JSON.stringify(initialCodes)) {
      onDataChange(newData);
    }
  }, [codesConfig, data, onDataChange]);

  // Handler for updating specific fields within a code
  const handleCodeChange = (codeKey, field, value) => {
    let updatedValue = value;

    // Convert to number if the field is 'nodes' or 'cpus'
    if (field === 'nodes' || field === 'cpus') {
      const parsedValue = parseInt(value, 10);
      if (!isNaN(parsedValue) && parsedValue > 0) {
        updatedValue = parsedValue;
      } else {
        // Handle invalid input by setting a default value (e.g., 1)
        updatedValue = 1;
      }
    }

    const updatedCodes = {
      ...data.codes,
      [codeKey]: {
        ...data.codes[codeKey],
        [field]: updatedValue,
      },
    };
    const newData = { ...data, codes: updatedCodes };
    console.log('newData', newData);
    onDataChange(newData);
  };

  return (
    <Form>
      {data.codes &&
        Object.entries(data.codes).map(([codeKey, codeConfig]) => (
          <div key={codeKey} className="mb-4">
            <CodeSelector
              codeLabel={codeKey}
              codeValue={codeConfig.label}
              onCodeChange={(value) => handleCodeChange(codeKey, 'label', value)}
              nodeValue={codeConfig.nodes}
              onNodeChange={(value) => handleCodeChange(codeKey, 'nodes', value)}
              cpuValue={codeConfig.cpus}
              onCpuChange={(value) => handleCodeChange(codeKey, 'cpus', value)}
              codeOptions={codeConfig.codeOptions}
            />
          </div>
        ))}
    </Form>
  );
};


export default CodeResourcesTab;
