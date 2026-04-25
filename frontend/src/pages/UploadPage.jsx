import React from 'react';
import FileDropZone from '../components/upload/FileDropZone';
import FitnessWeights from '../components/upload/FitnessWeights';
import TowerArraySettings from '../components/upload/TowerArraySettings';
import OptimizationStatus from '../components/upload/OptimizationStatus';

const UploadPage = () => {
  return (
    <div className="p-10 max-w-[1280px] mx-auto">
      <div className="mb-10">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-2">Upload & Configure</h1>
        <p className="text-lg font-medium text-gray-500">
          Initialize your network simulation by defining spatial constraints and signal parameters.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <FileDropZone />
        <FitnessWeights />
        <TowerArraySettings />
        <OptimizationStatus />
      </div>
    </div>
  );
};

export default UploadPage;
