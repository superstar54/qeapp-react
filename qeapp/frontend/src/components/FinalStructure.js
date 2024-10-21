import React, { useEffect, useState } from 'react';
import { Spinner, Table, Alert, Row, Col, Card } from 'react-bootstrap';
import StructureViewer from './StructureViewer';

// Convert AiiDA structure data to the format expected by Atoms
function structureToAtomsData(inputData) {
  const data = {
    cell: inputData.cell,
    pbc: [inputData.pbc1, inputData.pbc2, inputData.pbc3],
    species: {},
    symbols: [],
    positions: [],
  };

  // Process kinds to fill species information
  inputData.kinds.forEach((kind) => {
    data.species[kind.name] = kind.symbols[0];
  });

  // Process sites to fill positions and symbols
  inputData.sites.forEach((site) => {
    data.symbols.push(site.kind_name);
    data.positions.push(site.position);
  });

  return data;
}

const FinalStructureTab = ({ allStepsData = []}) => {
  const [finalStructure, setFinalStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isComponentMounted = true;

    const fetchFinalStructure = async () => {
      const jobId = allStepsData[3]?.data?.['Review settings']?.jobId;
      if (!jobId) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:8000/api/jobs-data/${jobId}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch final structure');
        }
        const data = await response.json();
        if (isComponentMounted) {
          const structure = structureToAtomsData(data.structure);
          setFinalStructure(structure);
          setLoading(false);
        }
      } catch (err) {
        if (isComponentMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchFinalStructure();

    return () => {
      isComponentMounted = false;
    };
  }, [allStepsData]);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  if (!finalStructure) {
    return <Alert variant="warning">No final structure available.</Alert>;
  }

  // Helper function to format the cell array
  const formatCell = (cell) => {
    return cell.map((vector) => vector.map((v) => v.toFixed(3)));
  };

  const formattedCell = formatCell(finalStructure.cell);

  return (
    <div>
      <h4 className="mb-4">Final Structure</h4>
      
      <Row>
        <Col md={6} sm={12} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Cell Parameters</Card.Title>
              <div className="table-responsive">
                <Table striped bordered hover size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th>Vector</th>
                      <th>x (Å)</th>
                      <th>y (Å)</th>
                      <th>z (Å)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>a₁</strong></td>
                      <td>{formattedCell[0][0]}</td>
                      <td>{formattedCell[0][1]}</td>
                      <td>{formattedCell[0][2]}</td>
                    </tr>
                    <tr>
                      <td><strong>a₂</strong></td>
                      <td>{formattedCell[1][0]}</td>
                      <td>{formattedCell[1][1]}</td>
                      <td>{formattedCell[1][2]}</td>
                    </tr>
                    <tr>
                      <td><strong>a₃</strong></td>
                      <td>{formattedCell[2][0]}</td>
                      <td>{formattedCell[2][1]}</td>
                      <td>{formattedCell[2][2]}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} sm={12} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Periodic Boundary Conditions (PBC)</Card.Title>
              <div className="d-flex justify-content-start align-items-center">
                <div className="me-3">
                  <strong>a:</strong> {finalStructure.pbc[0] ? 'True' : 'False'}
                </div>
                <div className="me-3">
                  <strong>b:</strong> {finalStructure.pbc[1] ? 'True' : 'False'}
                </div>
                <div>
                  <strong>c:</strong> {finalStructure.pbc[2] ? 'True' : 'False'}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Atomic Positions</Card.Title>
              <div className="table-responsive">
                <Table striped bordered hover size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Element</th>
                      <th>x (Å)</th>
                      <th>y (Å)</th>
                      <th>z (Å)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalStructure.positions.map((pos, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{finalStructure.symbols[index]}</td>
                        <td>{pos[0].toFixed(3)}</td>
                        <td>{pos[1].toFixed(3)}</td>
                        <td>{pos[2].toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Structure Viewer</Card.Title>
              <StructureViewer structure={finalStructure} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FinalStructureTab;