import ShareReport from "./ShareReport";
import html2canvas from 'html2canvas';
import { useState } from "react";

function SavePage(name) {
  const [showTooltip, setShowTooltip] = useState(false);
  const takeScreenshotAndDownload = () => {
    html2canvas(document.body).then(canvas => {
      const image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = name + '-' + timestamp + '.png';
      link.href = image;
      link.click();
    });
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={takeScreenshotAndDownload} 
        onMouseEnter={() => setShowTooltip(true)} 
        onMouseLeave={() => setShowTooltip(false)}
        >
          Save Page
      </button>
      {showTooltip && 
        <div className="tooltip_basic tooltip-left">
            Download
        </div>
      }
    </div>
  );
}

function PrintPage() {
  const [showTooltip, setShowTooltip] = useState(false);
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={handlePrint} 
        onMouseEnter={() => setShowTooltip(true)} 
        onMouseLeave={() => setShowTooltip(false)}
        >
          Print Page
      </button>
      {showTooltip && 
        <div className="tooltip_basic tooltip-right">
            Print
        </div>
      }
    </div>
  );
}

const ReportToolSuite = (name) => {
  return <div>
    {ShareReport(name)}
    {SavePage(name)}
    {PrintPage()}
  </div>
}

export default ReportToolSuite;