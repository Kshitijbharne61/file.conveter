(function(){
  window.compressImageTool = async function(file){
    const qualityInput=document.getElementById('image-quality');
    const quality=Math.max(0.1,Math.min(0.95,Number(qualityInput?.value||70)/100));
    if(!file || !file.type.startsWith('image/')) throw new Error('Please select a JPG, PNG, or WebP image.');
    setProgress(10,'Loading image…');
    const objectUrl=URL.createObjectURL(file);
    try{
      const img=await new Promise((resolve,reject)=>{
        const el=new Image();
        el.onload=()=>resolve(el);
        el.onerror=()=>reject(new Error('This image could not be read by your browser.'));
        el.src=objectUrl;
      });
      setProgress(35,'Compressing image…');
      const maxDimension=5000;
      const scale=Math.min(1,maxDimension/Math.max(img.naturalWidth,img.naturalHeight));
      const canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
      canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
      const ctx=canvas.getContext('2d',{alpha:false});
      if(!ctx) throw new Error('Your browser does not support image compression.');
      ctx.fillStyle='#ffffff';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      const output=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));
      if(!output) throw new Error('Compression failed. Try another image.');
      setProgress(85,'Preparing download…');
      const base=(file.name||'image').replace(/\.[^.]+$/,'');
      const outputName=base+'-compressed.jpg';
      downloadBlob(output,outputName);
      const saved=Math.max(0,file.size-output.size);
      const percent=file.size?Math.round(saved/file.size*100):0;
      done(`Compressed image downloaded (${formatBytes(file.size)} → ${formatBytes(output.size)}${percent>0?`, ${percent}% smaller`:''}).`);
    }finally{
      URL.revokeObjectURL(objectUrl);
    }
  };
})();