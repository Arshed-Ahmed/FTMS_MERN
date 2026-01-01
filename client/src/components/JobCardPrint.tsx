import React from 'react';

const JobCardPrint = React.forwardRef(({ job }, ref) => {
  if (!job) return null;

  return (
    <div ref={ref} className="p-8 bg-white text-black print:block hidden">
      <div className="border-2 border-black p-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wider">Job Card</h1>
            <p className="text-sm mt-1">Order #{job.order?._id}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">FTMS Tailoring</h2>
            <p className="text-sm">123 Fashion Street</p>
            <p className="text-sm">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="font-bold border-b border-black mb-2">Customer Details</h3>
            <p><span className="font-semibold">Name:</span> {job.order?.customer?.firstName} {job.order?.customer?.lastName}</p>
            <p><span className="font-semibold">Phone:</span> {job.order?.customer?.phone}</p>
            <p><span className="font-semibold">Email:</span> {job.order?.customer?.email}</p>
          </div>
          <div>
            <h3 className="font-bold border-b border-black mb-2">Job Details</h3>
            <p><span className="font-semibold">Assigned To:</span> {job.employee?.name || 'Unassigned'}</p>
            <p><span className="font-semibold">Deadline:</span> {new Date(job.deadline).toLocaleDateString()}</p>
            <p><span className="font-semibold">Status:</span> {job.status}</p>
          </div>
        </div>

        {/* Measurements */}
        <div className="mb-6">
          <h3 className="font-bold border-b border-black mb-4">Measurements</h3>
          <div className="grid grid-cols-3 gap-4">
            {/* This assumes measurements are stored in a way we can access. 
                If not, we might need to fetch them or just show a placeholder. 
                For now, I'll show a generic grid for writing measurements if not available. */}
             {/* Placeholder for manual entry if digital ones aren't linked directly to job yet */}
             {[...Array(9)].map((_, i) => (
               <div key={i} className="border border-gray-300 p-2 h-16">
                 <span className="text-xs text-gray-500">Field {i + 1}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Design/Style Notes */}
        <div className="mb-6">
          <h3 className="font-bold border-b border-black mb-4">Style & Design Notes</h3>
          <div className="border border-gray-300 p-4 h-48">
            <p>{job.details}</p>
            {/* Space for sketch */}
          </div>
        </div>

        {/* Fabric Swatch */}
        <div className="mb-6">
          <h3 className="font-bold border-b border-black mb-4">Fabric Swatch</h3>
          <div className="border border-dashed border-gray-400 h-32 flex items-center justify-center text-gray-400">
            Attach Fabric Swatch Here
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-4 border-t-2 border-black flex justify-between text-sm">
          <div>
            <p>Cutter Signature: _________________</p>
          </div>
          <div>
            <p>Tailor Signature: _________________</p>
          </div>
          <div>
            <p>QC Checked: _________________</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default JobCardPrint;
