const LESSON_EDITS_KEY='survival-lesson-edits-v1';
const LESSON_EDITOR_PIN='6767';
const lessonEditor={unlocked:false,tab:'slide',catalog:[],draft:null,uploads:0,imageDrafts:new Map(),data:{version:1,texts:{},images:{},slides:{},questions:null,prizes:null},defaults:null};
function lessonPlainObject(value){return !!value&&typeof value==='object'&&!Array.isArray(value)}
function lessonText(value,max=1200){if(typeof value!=='string'||value.length>max)throw Error('An edit contains invalid or overly long text.');return value}
function lessonImageSource(value){
 if(typeof value!=='string'||value.length>1500000)throw Error('Use a smaller image.');
 if(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value))return value;
 let url;try{url=new URL(value,location.href)}catch{throw Error('Enter a valid image URL.')}
 if(url.username||url.password||!(url.protocol==='https:'||(url.protocol==='http:'&&url.origin===location.origin)))throw Error('Use an HTTPS image URL or upload a PNG, JPEG or WebP image.');
 return url.href;
}
function validateLessonEdits(input){
 if(!lessonPlainObject(input)||input.version!==1)throw Error('This is not a supported lesson edits file.');
 const result={version:1,texts:{},images:{},slides:{},questions:null,prizes:null};
 for(const [kind,maxCount] of [['texts',3000],['images',80]]){
  const values=input[kind]??{};
  if(!lessonPlainObject(values)||Object.keys(values).length>maxCount)throw Error('The edits file contains too many fields.');
  for(const [key,value] of Object.entries(values)){
   if(!/^[a-zA-Z0-9:_-]{1,140}$/.test(key)||['__proto__','constructor','prototype'].includes(key))throw Error('The edits file contains an invalid field.');
   result[kind][key]=kind==='texts'?lessonText(value):lessonImageSource(value);
  }
 }
 const meta=input.slides??{};if(!lessonPlainObject(meta)||Object.keys(meta).length>40)throw Error('Invalid slide information.');
 for(const [key,value] of Object.entries(meta)){
  if(!/^[a-zA-Z0-9:_-]{1,80}$/.test(key)||['__proto__','constructor','prototype'].includes(key)||!lessonPlainObject(value))throw Error('Invalid slide information.');
  const entry={};for(const [field,limit] of [['title',180],['section',120],['time',50],['ayman',5000],['milo',5000]])if(Object.hasOwn(value,field))entry[field]=lessonText(value[field],limit);
  result.slides[key]=entry;
 }
 if(input.questions!==null&&input.questions!==undefined){
  if(!Array.isArray(input.questions)||input.questions.length!==6)throw Error('Keep all six Billionaire questions.');
  result.questions=input.questions.map(q=>{
   if(!lessonPlainObject(q)||!Array.isArray(q.opts)||q.opts.length!==4||!Number.isInteger(q.ans)||q.ans<0||q.ans>3)throw Error('Each question needs four answers and one correct answer.');
   const question={q:lessonText(q.q,500).trim(),host:lessonText(q.host,50).trim(),opts:q.opts.map(o=>lessonText(o,300).trim()),ans:q.ans,why:lessonText(q.why,1200).trim()};
   if(!question.q||!question.host||question.opts.some(o=>!o)||new Set(question.opts.map(o=>o.toLowerCase())).size!==4)throw Error('Fill every question and use four different answer options.');
   return question;
  });
 }
 if(input.prizes!==null&&input.prizes!==undefined){
  if(!Array.isArray(input.prizes)||input.prizes.length!==6||input.prizes.some((n,i)=>!Number.isSafeInteger(n)||n<1||n>1000000000000000||(i&&n<=input.prizes[i-1])))throw Error('Enter six increasing, whole-number prizes between 1 and 1,000,000,000,000,000.');
  result.prizes=input.prizes.slice();
 }
 return result;
}
function lessonSlideKey(s){return s.type==='quote'?'quote:'+QUOTES[s.quoteIndex].id:s.type}
function lessonHash(value){let a=2166136261,b=5381;for(let i=0;i<value.length;i++){const c=value.charCodeAt(i);a=Math.imul(a^c,16777619);b=Math.imul(b,33)^c}return (a>>>0).toString(36)+'_'+(b>>>0).toString(36)}
function applyLessonConfiguration(){
 const d=lessonEditor.defaults;if(!d)return;
 QUIZ.splice(0,QUIZ.length,...structuredClone(lessonEditor.data.questions??d.questions));
 GAME_PRIZES.splice(0,GAME_PRIZES.length,...(lessonEditor.data.prizes??d.prizes));
 slides.forEach((s,i)=>{Object.assign(s,d.slides[i]);const values=lessonEditor.data.slides[lessonSlideKey(s)];if(values)Object.assign(s,values)});
}
function lessonError(message){const el=document.getElementById('lessonEditError');if(el)el.textContent=message}
function applyLessonEdits(root,s){
 const scope=lessonSlideKey(s),seen=new Map(),catalog=[];
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];
 while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){
  const original=node.nodeValue,parent=node.parentElement;
  if(!original.trim()||!parent||parent.closest('script,style,.billionaire-game,.money-result,.slide-footer,[data-no-lesson-edit]'))continue;
  const count=seen.get(original)||0;seen.set(original,count+1);
  const key=scope+':text:'+lessonHash(original)+':'+count,value=Object.hasOwn(lessonEditor.data.texts,key)?lessonEditor.data.texts[key]:original;
  const entry={key,kind:'text',original,value,label:parent.tagName.toLowerCase()+': '+original.trim().slice(0,64),heading:!!parent.closest('h1,h2')};catalog.push(entry);
  if(lessonEditor.unlocked){
   const span=document.createElement('span');span.textContent=value;span.dataset.lessonTextKey=key;span.className='lesson-edit-target';span.tabIndex=0;span.title='Edit this text';node.replaceWith(span);
  }else node.nodeValue=value;
 }
 const imageKeys=new Set();
 root.querySelectorAll('img').forEach(img=>{
  const original=img.getAttribute('src');if(!original)return;
  const key='image:'+lessonHash(original),value=lessonEditor.data.images[key]??original;
  if(!imageKeys.has(key)){catalog.push({key,kind:'image',original,value,label:img.alt||'Slide image'});imageKeys.add(key)}
  if(value!==original)img.src=value;
  if(lessonEditor.unlocked){img.dataset.lessonImageKey=key;img.classList.add('lesson-image-target');img.tabIndex=0;img.title='Edit this image'}
 });
 lessonEditor.catalog=catalog;
 document.body.classList.toggle('lesson-editing',lessonEditor.unlocked);
 document.getElementById('lessonEditBar').hidden=!lessonEditor.unlocked;
 const toggle=document.getElementById('editModeToggle');toggle.textContent=lessonEditor.unlocked?'Lock editing':'Edit slides';toggle.setAttribute('aria-pressed',String(lessonEditor.unlocked));
}
function lessonField(label,value,attrs='',multiline=false){const safe=esc(value);return `<label class="lesson-field"><span>${esc(label)}</span>${multiline?`<textarea ${attrs} rows="3">${safe}</textarea>`:`<input ${attrs} value="${safe}">`}</label>`}
function fillLessonEditor(tab){
 lessonEditor.tab=tab;lessonError('');
 document.querySelectorAll('[data-editor-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.editorTab===tab)));
 const scope=lessonSlideKey(slides[state.index]),draft=lessonEditor.draft||lessonEditor.data,s={...slides[state.index],...(draft.slides[scope]||{})};let html='';
 if(tab==='slide'){
  html=`<p class="lesson-edit-note">Slide ${state.index+1}: ${esc(s.title)}. Text is saved as plain text.</p><fieldset><legend>Slide details and speaker notes</legend>${lessonField('Slide title / thumbnail',s.title,'data-lesson-meta="title" maxlength="180"')}${lessonField('Section',s.section,'data-lesson-meta="section" maxlength="120"')}${lessonField('Suggested time',s.time,'data-lesson-meta="time" maxlength="50"')}${lessonField('Ayman’s speaker notes',s.ayman,'data-lesson-meta="ayman" maxlength="5000"',true)}${lessonField('Milo’s speaker notes',s.milo,'data-lesson-meta="milo" maxlength="5000"',true)}</fieldset>`;
  const texts=lessonEditor.catalog.filter(e=>e.kind==='text');
  html+=texts.length?`<fieldset><legend>Visible slide text</legend>${texts.map(e=>lessonField(e.label,draft.texts[e.key]??e.original,`data-lesson-text="${esc(e.key)}" maxlength="1200"`,e.value.length>90)).join('')}</fieldset>`:'<p class="lesson-edit-note">Use “Game questions” to edit this game’s questions, answers and explanations.</p>';
  html+='<fieldset><legend>Images</legend><p class="lesson-edit-note">Replacing a reused image changes it throughout this browser’s copy of the lesson.</p>';
  html+=lessonEditor.catalog.filter(e=>e.kind==='image').map(entry=>{const e={...entry,value:draft.images[entry.key]??entry.original};return `<div class="lesson-image-field" data-image-card="${esc(e.key)}"><strong>${esc(e.label)}</strong><img class="lesson-image-preview" src="${esc(e.value)}" alt="Current image preview"><label class="lesson-field"><span>Image URL (HTTPS)</span><input data-lesson-image="${esc(e.key)}" value="${e.value.startsWith('https:')?esc(e.value):''}" type="url" placeholder="https://example.com/image.jpg"></label><label class="lesson-upload"><span>Or upload a PNG, JPEG or WebP image</span><input type="file" accept="image/png,image/jpeg,image/webp" data-lesson-upload="${esc(e.key)}"></label><button class="lesson-secondary" type="button" data-lesson-original="${esc(e.key)}">Use original image</button><span class="lesson-image-status" role="status"></span></div>`}).join('')+'</fieldset>';
 }else if(tab==='questions'){
  html='<p class="lesson-edit-note">Saving question changes starts a new game. Choose exactly one correct answer for each round.</p>';
  html+=(draft.questions??QUIZ).map((q,i)=>`<fieldset data-lesson-question="${i}"><legend>Round ${i+1}</legend>${lessonField('Question',q.q,'data-q-field="q" maxlength="500"',true)}${lessonField('Host',q.host,'data-q-field="host" maxlength="50"')}${q.opts.map((o,j)=>lessonField('Answer '+('ABCD'[j]),o,`data-q-option="${j}" maxlength="300"`)).join('')}<label class="lesson-field"><span>Correct answer</span><select data-q-field="ans">${q.opts.map((_,j)=>`<option value="${j}" ${q.ans===j?'selected':''}>${'ABCD'[j]}</option>`).join('')}</select></label>${lessonField('Answer explanation',q.why,'data-q-field="why" maxlength="1200"',true)}</fieldset>`).join('');
 }else{
  html='<p class="lesson-edit-note">Use six increasing prizes in Israeli Shekels. Round 3 remains the checkpoint. Saving prize changes starts a new game.</p><fieldset><legend>Prize ladder</legend>';
  html+=(draft.prizes??GAME_PRIZES).map((n,i)=>lessonField('Round '+(i+1)+(i===2?' (checkpoint)':''),String(n),`data-lesson-prize="${i}" type="number" min="1" max="1000000000000000" step="1" required`)).join('')+'</fieldset>';
 }
 document.getElementById('lessonEditFields').innerHTML=html;
 document.getElementById('lessonEditFields').scrollTop=0;
 document.getElementById('lessonEditForm').dataset.scope=scope;
}
function openLessonEditor(tab='slide',key){
 if(!lessonEditor.unlocked)return;
 lessonEditor.draft=structuredClone(lessonEditor.data);lessonEditor.imageDrafts.clear();fillLessonEditor(tab);const dialog=document.getElementById('lessonContentDialog');if(!dialog.open)dialog.showModal();
 if(key){const input=[...dialog.querySelectorAll('[data-lesson-text],[data-lesson-image]')].find(el=>el.dataset.lessonText===key||el.dataset.lessonImage===key);if(input){input.focus();input.scrollIntoView({block:'center'})}}
}
function lockLessonEditor(){
 lessonEditor.unlocked=false;document.getElementById('lessonContentDialog').close();lessonEditor.imageDrafts.clear();render();toast('Editing locked.');
}
function requestLessonUnlock(){
 if(lessonEditor.unlocked){lockLessonEditor();return}
 const form=document.getElementById('lessonPinForm');form.reset();document.getElementById('lessonPinError').textContent='';document.getElementById('lessonPinDialog').showModal();document.getElementById('lessonPin').focus();
}
function persistLessonEdits(value){
 const data=validateLessonEdits(value);const text=JSON.stringify(data);if(text.length>3500000)throw Error('These edits are too large. Use smaller images.');
 try{localStorage.setItem(LESSON_EDITS_KEY,text)}catch{throw Error('This browser could not save the edits. Use smaller images or free some browser storage.');}
 const gameChanged=JSON.stringify(data.questions)!==JSON.stringify(lessonEditor.data.questions)||JSON.stringify(data.prizes)!==JSON.stringify(lessonEditor.data.prizes);
 lessonEditor.data=data;applyLessonConfiguration();return gameChanged;
}
function collectLessonForm(){
 const candidate=structuredClone(lessonEditor.draft||lessonEditor.data),form=document.getElementById('lessonEditForm');
  if(lessonEditor.tab==='slide'){
   const meta={};form.querySelectorAll('[data-lesson-meta]').forEach(el=>{meta[el.dataset.lessonMeta]=el.value});
   form.querySelectorAll('[data-lesson-text]').forEach(el=>{
    const key=el.dataset.lessonText,entry=lessonEditor.catalog.find(e=>e.key===key);if(!entry)return;
    if(el.value===entry.original)delete candidate.texts[key];else candidate.texts[key]=el.value;
    if(entry.heading&&entry.original.trim()===slides[state.index].title&&el.value!==entry.value)meta.title=el.value.trim();
   });
   candidate.slides[form.dataset.scope]=meta;
   form.querySelectorAll('[data-lesson-image]').forEach(el=>{
    const key=el.dataset.lessonImage;
    if(lessonEditor.imageDrafts.has(key)){const value=lessonEditor.imageDrafts.get(key);if(value===null)delete candidate.images[key];else candidate.images[key]=value}
    else if(el.value.trim())candidate.images[key]=lessonImageSource(el.value.trim());
   });
  }else if(lessonEditor.tab==='questions'){
   candidate.questions=[...form.querySelectorAll('[data-lesson-question]')].map(group=>({q:group.querySelector('[data-q-field="q"]').value,host:group.querySelector('[data-q-field="host"]').value,opts:[...group.querySelectorAll('[data-q-option]')].map(el=>el.value),ans:Number(group.querySelector('[data-q-field="ans"]').value),why:group.querySelector('[data-q-field="why"]').value}));
  }else candidate.prizes=[...form.querySelectorAll('[data-lesson-prize]')].map(el=>Number(el.value));
 lessonEditor.draft=candidate;return candidate;
}
function saveLessonEditor(event){
 event.preventDefault();if(!lessonEditor.unlocked||lessonEditor.uploads)return;
 try{
  const candidate=collectLessonForm();
  if(Object.values(candidate.slides).some(s=>s.title!==undefined&&!s.title.trim()))throw Error('Give every edited slide a title.');
  const gameChanged=persistLessonEdits(candidate);document.getElementById('lessonContentDialog').close();
  if(gameChanged)resetBillionaire();else render();toast('Edits saved in this browser.');
 }catch(error){lessonError(error.message)}
}
async function uploadLessonImage(input){
 if(!lessonEditor.unlocked||!input.files[0])return;
 const file=input.files[0],card=input.closest('[data-image-card]'),status=card.querySelector('.lesson-image-status');
 try{
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>8000000)throw Error('Choose a PNG, JPEG or WebP image smaller than 8 MB.');
  lessonEditor.uploads++;document.getElementById('lessonEditSave').disabled=true;status.textContent='Preparing image…';
  const url=URL.createObjectURL(file),img=new Image();let data;
  try{img.src=url;await img.decode();const scale=Math.min(1,1400/Math.max(img.naturalWidth,img.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);data=canvas.toDataURL('image/webp',.84)}finally{URL.revokeObjectURL(url)}
  lessonImageSource(data);if(!lessonEditor.unlocked)return;
  lessonEditor.imageDrafts.set(input.dataset.lessonUpload,data);card.querySelector('.lesson-image-preview').src=data;card.querySelector('[data-lesson-image]').value='';status.textContent='Image ready. Save changes to apply it.';
 }catch(error){status.textContent=error.message}finally{lessonEditor.uploads=Math.max(0,lessonEditor.uploads-1);document.getElementById('lessonEditSave').disabled=lessonEditor.uploads>0}
}
function exportLessonEdits(){
 if(!lessonEditor.unlocked)return;
 const blob=new Blob([JSON.stringify({format:'survival-lesson-edits',version:1,edits:lessonEditor.data},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='survival-lesson-edits.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Edits exported.');
}
async function importLessonEdits(input){
 if(!lessonEditor.unlocked||!input.files[0])return;
 try{
  if(input.files[0].size>3500000)throw Error('Choose an edits file smaller than 3.5 MB.');
  const file=JSON.parse(await input.files[0].text());if(file.format!=='survival-lesson-edits'||file.version!==1)throw Error('Choose a Survival lesson edits JSON file.');
  const changed=persistLessonEdits(file.edits);if(changed)resetBillionaire();else render();toast('Edits imported and saved in this browser.');
 }catch(error){document.getElementById('lessonImportStatus').textContent=error.message}finally{input.value=''}
}
function initializeLessonEditor(){
 lessonEditor.defaults={questions:structuredClone(QUIZ),prizes:GAME_PRIZES.slice(),slides:slides.map(s=>Object.fromEntries(['title','section','time','ayman','milo'].map(k=>[k,s[k]])))};
 try{const raw=localStorage.getItem(LESSON_EDITS_KEY);if(raw)lessonEditor.data=validateLessonEdits(JSON.parse(raw))}catch{document.getElementById('lessonImportStatus').textContent='Saved edits could not be loaded. You can import an exported copy after unlocking editing.'}
 applyLessonConfiguration();
 document.getElementById('editModeToggle').addEventListener('click',requestLessonUnlock);
 document.getElementById('lessonPinForm').addEventListener('submit',event=>{
  event.preventDefault();const input=document.getElementById('lessonPin'),error=document.getElementById('lessonPinError');
  if(input.value!==LESSON_EDITOR_PIN){error.textContent='Incorrect PIN. Try again.';input.focus();input.select();return}
  lessonEditor.unlocked=true;input.value='';document.getElementById('lessonPinDialog').close();render();toast('Editing unlocked. Select text or an image to edit.');
 });
 document.getElementById('lessonPin').addEventListener('input',event=>{event.target.value=event.target.value.replace(/\D/g,'').slice(0,4)});
 document.getElementById('lessonEditCurrent').addEventListener('click',()=>openLessonEditor());
 document.getElementById('lessonEditLock').addEventListener('click',lockLessonEditor);
 document.getElementById('lessonEditExport').addEventListener('click',exportLessonEdits);
 document.getElementById('lessonEditImport').addEventListener('click',()=>{if(lessonEditor.unlocked){document.getElementById('lessonImportStatus').textContent='';document.getElementById('lessonImportFile').click()}});
 document.getElementById('lessonImportFile').addEventListener('change',event=>importLessonEdits(event.target));
 document.getElementById('lessonEditForm').addEventListener('submit',saveLessonEditor);
 document.getElementById('lessonContentDialog').addEventListener('change',event=>{if(event.target.matches('[data-lesson-upload]'))uploadLessonImage(event.target)});
 document.getElementById('lessonContentDialog').addEventListener('click',event=>{
  const tab=event.target.closest('[data-editor-tab]');if(tab){if(lessonEditor.uploads)return;try{collectLessonForm();lessonEditor.imageDrafts.clear();fillLessonEditor(tab.dataset.editorTab)}catch(error){lessonError(error.message)}return}
  const reset=event.target.closest('[data-lesson-original]');if(reset){const key=reset.dataset.lessonOriginal,entry=lessonEditor.catalog.find(e=>e.key===key);if(entry){lessonEditor.imageDrafts.set(key,null);const card=reset.closest('[data-image-card]');card.querySelector('.lesson-image-preview').src=entry.original;card.querySelector('[data-lesson-image]').value='';card.querySelector('.lesson-image-status').textContent='Original image ready. Save changes to apply it.'}}
 });
 document.addEventListener('click',event=>{
  if(!lessonEditor.unlocked||!event.target.closest('#slide'))return;
  const el=event.target.closest('[data-lesson-text-key],[data-lesson-image-key]');if(!el)return;
  event.preventDefault();event.stopImmediatePropagation();openLessonEditor('slide',el.dataset.lessonTextKey||el.dataset.lessonImageKey);
 },true);
 document.addEventListener('keydown',event=>{
  if(event.key!=='Enter'||!lessonEditor.unlocked)return;
  const el=event.target.closest('[data-lesson-text-key],[data-lesson-image-key]');if(!el)return;
  event.preventDefault();event.stopImmediatePropagation();openLessonEditor('slide',el.dataset.lessonTextKey||el.dataset.lessonImageKey);
 },true);
}
