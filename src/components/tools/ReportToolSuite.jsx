import ShareReport from "./ShareReport";
import html2canvas from 'html2canvas';

function SavePage(name) {
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
    <button onClick={takeScreenshotAndDownload}>Save Page</button>
  );
}

function PrintPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button onClick={handlePrint}>Print Page</button>
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