(function(){
  const fileInput=document.getElementById('compress-file');
  const dropZone=document.getElementById('compress-drop-zone');
  const qualityInput=document.getElementById('image-quality');
  const qualityValue=document.getElementById('quality-value');
  const compressBtn=document.getElementById('compress-btn');
  const fileInfo=document.getElementById('file-info');
  const fileName=document.getElementById('file-name');
  const fileSize=document.getElementById('file-size');
  const qualityPanel=document.getElementById('quality-panel');
  const progressWrap=document.getElementById('progress-wrap');
  const progressBar=document.getElementById('progress-bar');
  const status=document.getElementById('status');
  const result=document.getElementById('result');
  let selectedFile=null;

  function bytes(n){if(n<1024)return n+' B';if(n<1048576)return (n/1024).toFixed(1)+' KB';return (n/1048576).toFixed(2)+' MB';}
  function progress(value,text){progressWrap.classList.remove('hidden');progressBar.style.width=value+'%';status.textContent=text;}
  function selectFile(file){
    if(!file || !file.type.match(/^image\/(jpeg|png|webp)$/)){alert('Please select a JPG, PNG, or WebP image.');return;}
    selectedFile=file;fileName.textContent=file.name;fileSize.textContent='Original size: '+bytes(file.size);
    fileInfo.classList.remove('hidden');qualityPanel.classList.remove('hidden');compressBtn.disabled=false;result.classList.add('hidden');progressWrap.classList.add('hidden');
  }
  fileInput.addEventListener('change',e=>selectFile(e.target.files[0]));
  qualityInput.addEventListener('input',()=>qualityValue.textContent=qualityInput.value+'%');
  ['dragenter','dragover'].forEach(ev=>dropZone.addEventListener(ev,e=>{e.preventDefault();dropZone.classList.add('bg-red-50');}));
  ['dragleave','drop'].forEach(ev=>dropZone.addEventListener(ev,e=>{e.preventDefault();dropZone.classList.remove('bg-red-50');}));
  dropZone.addEventListener('drop',e=>selectFile(e.dataTransfer.files[0]));

  compressBtn.addEventListener('click',async()=>{
    if(!selectedFile)return;
    compressBtn.disabled=true;result.classList.add('hidden');progress(10,'Loading image…');
    const url=URL.createObjectURL(selectedFile);
    try{
      const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('This image could not be read.'));i.src=url;});
      progress(35,'Compressing image…');
      const max=5000,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
      const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Your browser does not support image compression.');
      ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
      const quality=Number(qualityInput.value)/100;
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));if(!blob)throw new Error('Compression failed.');
      progress(85,'Preparing download…');
      const base=selectedFile.name.replace(/\.[^.]+$/,'');const outName=base+'-compressed.jpg';
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=outName;document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(a.href),1000);
      const saved=Math.max(0,selectedFile.size-blob.size),pct=selectedFile.size?Math.round(saved/selectedFile.size*100):0;
      progress(100,'Done');result.classList.remove('hidden');result.innerHTML='<strong>✅ Compression complete</strong><div class="mt-2">'+bytes(selectedFile.size)+' → '+bytes(blob.size)+(pct>0?' ('+pct+'% smaller)':'')+'</div><div class="text-sm mt-1 text-slate-600">Downloaded as '+outName+'</div>';
    }catch(err){progressWrap.classList.remove('hidden');status.textContent='Error: '+err.message;}finally{URL.revokeObjectURL(url);compressBtn.disabled=false;}
  });
})();