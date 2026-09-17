export default function AuthorGuidelinesPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-3xl">
      <div className="mb-10 border-b border-slate-200 dark:border-slate-800 pb-8">
        <h1 className="text-4xl font-serif text-slate-900 dark:text-white mb-4">Author Guidelines</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-serif">
          Essential instructions for preparing and submitting your manuscript.
        </p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-loose">
        <h2>1. General Requirements</h2>
        <p>All submissions must be original, unpublished work. Manuscripts should be written in clear, concise English or Indonesian.</p>

        <h2>2. Manuscript Structure</h2>
        <p>A standard manuscript should include the following sections:</p>
        <ul>
          <li><strong>Title Page:</strong> Title, author names, affiliations, and contact information.</li>
          <li><strong>Abstract:</strong> A summary of 150-250 words.</li>
          <li><strong>Keywords:</strong> 3-5 keywords for indexing.</li>
          <li><strong>Introduction:</strong> Background, problem statement, and objectives.</li>
          <li><strong>Methodology:</strong> Detailed description of the research design and methods.</li>
          <li><strong>Results & Discussion:</strong> Presentation of findings and their implications.</li>
          <li><strong>Conclusion:</strong> Summary of the main findings and future directions.</li>
          <li><strong>References:</strong> Cited according to APA style.</li>
        </ul>

        <h2>3. Submission Process</h2>
        <p>All manuscripts must be submitted electronically via our online submission system. You will need to create an account to begin the process.</p>
      </div>
    </div>
  );
}
