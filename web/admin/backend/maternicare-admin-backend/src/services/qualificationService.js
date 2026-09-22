import { supabaseAdmin as supabase } from '../config/supabase.js';

const BUCKET_NAME = 'qualifications';

/**
 * Ensures the 'qualifications' Supabase storage bucket exists and is public.
 */
async function ensureBucketExists() {
  try {
    const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
    if (!listErr && buckets) {
      const exists = buckets.some((b) => b.name === BUCKET_NAME);
      if (!exists) {
        await supabase.storage.createBucket(BUCKET_NAME, { public: true });
      }
    }
  } catch (err) {
    console.warn('Storage bucket setup notice:', err.message);
  }
}

/**
 * Uploads a document (Base64 or DataURL) to Supabase Storage under qualifications bucket.
 * Returns { publicUrl, storagePath } or null if no document.
 */
export async function uploadQualificationFile(userId, fileBase64OrDataUrl, fileName = 'doc') {
  if (!fileBase64OrDataUrl || typeof fileBase64OrDataUrl !== 'string') {
    return { publicUrl: null, storagePath: null };
  }

  // If it's already a http/https URL, return as is
  if (fileBase64OrDataUrl.startsWith('http://') || fileBase64OrDataUrl.startsWith('https://')) {
    return { publicUrl: fileBase64OrDataUrl, storagePath: null };
  }

  try {
    await ensureBucketExists();

    let mimeType = 'application/octet-stream';
    let base64Data = fileBase64OrDataUrl;

    if (fileBase64OrDataUrl.includes(';base64,')) {
      const parts = fileBase64OrDataUrl.split(';base64,');
      mimeType = parts[0].replace('data:', '') || mimeType;
      base64Data = parts[1];
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const sanitizedFileName = (fileName || 'document').replace(/[^a-zA-Z0-9_.-]/g, '_');
    const storagePath = `user_${userId}/${Date.now()}_${sanitizedFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.warn('Supabase storage upload warning:', uploadError.message);
      // Fallback: If bucket fails, store base64 or null
      return { publicUrl: fileBase64OrDataUrl, storagePath: null };
    }

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
    return {
      publicUrl: urlData?.publicUrl || null,
      storagePath,
    };
  } catch (err) {
    console.error('File upload error:', err);
    return { publicUrl: fileBase64OrDataUrl, storagePath: null };
  }
}

export const qualificationService = {
  /**
   * Fetches all qualification records for a specific staff member.
   */
  getQualificationsByUserId: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('staff_details_qualifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, message: error.message, data: [] };
    }
  },

  /**
   * Creates a single qualification record.
   */
  createQualification: async (userId, data) => {
    try {
      let documentUrl = data.document_url || data.documentUrl || null;
      let documentPath = data.document_path || data.documentPath || null;

      if (data.qualificationDoc || data.qualification_doc) {
        const docPayload = data.qualificationDoc || data.qualification_doc;
        const uploadResult = await uploadQualificationFile(userId, docPayload, data.fileName || 'qualification_doc');
        documentUrl = uploadResult.publicUrl || documentUrl;
        documentPath = uploadResult.storagePath || documentPath;
      }

      const insertPayload = {
        user_id: parseInt(userId, 10),
        license_number: data.license_number || data.licenseNumber || null,
        professional_start_date: data.professional_start_date || data.professionalStartDate || null,
        qualification_title: data.qualification_title || data.qualificationTitle || data.qualifications || 'Qualification Entry',
        document_url: documentUrl,
        document_path: documentPath,
        uploaded_date: data.uploaded_date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      };

      const { data: result, error } = await supabase
        .from('staff_details_qualifications')
        .insert(insertPayload)
        .select('*')
        .single();

      if (error) throw error;
      return { success: true, data: result, message: 'Qualification added successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  /**
   * Batch creates qualification records during staff registration.
   */
  createQualificationsBatch: async (userId, qualificationsArray = [], commonLicense = null, commonStartDate = null) => {
    try {
      if (!Array.isArray(qualificationsArray) || qualificationsArray.length === 0) {
        return { success: true, data: [] };
      }

      const insertPromises = qualificationsArray.map(async (item) => {
        let docUrl = item.documentUrl || item.document_url || item.qualificationDoc || item.qualification_doc || null;
        let docPath = item.documentPath || item.document_path || null;

        if (docUrl && (docUrl.startsWith('data:') || !docUrl.startsWith('http'))) {
          const uploadRes = await uploadQualificationFile(userId, docUrl, item.fileName || 'qualification_file');
          docUrl = uploadRes.publicUrl || docUrl;
          docPath = uploadRes.storagePath || docPath;
        }

        return {
          user_id: parseInt(userId, 10),
          license_number: item.licenseNumber || item.license_number || commonLicense || null,
          professional_start_date: item.professionalStartDate || item.professional_start_date || commonStartDate || null,
          qualification_title: item.qualificationTitle || item.qualification_title || item.qualifications || item.title || 'Qualification Entry',
          document_url: docUrl,
          document_path: docPath,
          uploaded_date: item.uploadedDate || item.uploaded_date || new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
        };
      });

      const recordsToInsert = await Promise.all(insertPromises);

      const { data: results, error } = await supabase
        .from('staff_details_qualifications')
        .insert(recordsToInsert)
        .select('*');

      if (error) throw error;
      return { success: true, data: results || [] };
    } catch (error) {
      console.error('Batch qualification insert error:', error.message);
      return { success: false, message: error.message };
    }
  },

  /**
   * Updates an existing qualification record.
   */
  updateQualification: async (qualificationId, data) => {
    try {
      const updatePayload = {};

      if (data.qualification_title !== undefined || data.qualificationTitle !== undefined || data.qualifications !== undefined) {
        updatePayload.qualification_title = data.qualification_title ?? data.qualificationTitle ?? data.qualifications;
      }
      if (data.license_number !== undefined || data.licenseNumber !== undefined) {
        updatePayload.license_number = data.license_number ?? data.licenseNumber;
      }
      if (data.professional_start_date !== undefined || data.professionalStartDate !== undefined) {
        updatePayload.professional_start_date = data.professional_start_date ?? data.professionalStartDate;
      }

      if (data.qualificationDoc || data.qualification_doc || data.documentUrl || data.document_url) {
        const docPayload = data.qualificationDoc || data.qualification_doc || data.documentUrl || data.document_url;
        if (docPayload && (docPayload.startsWith('data:') || !docPayload.startsWith('http'))) {
          const userId = data.user_id || data.userId || 0;
          const uploadRes = await uploadQualificationFile(userId, docPayload, data.fileName || 'updated_doc');
          updatePayload.document_url = uploadRes.publicUrl;
          updatePayload.document_path = uploadRes.storagePath;
        } else {
          updatePayload.document_url = docPayload;
        }
      }

      const { data: result, error } = await supabase
        .from('staff_details_qualifications')
        .update(updatePayload)
        .eq('id', parseInt(qualificationId, 10))
        .select('*')
        .single();

      if (error) throw error;
      return { success: true, data: result, message: 'Qualification updated successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  /**
   * Deletes an individual qualification record and optionally removes file from storage.
   */
  deleteQualification: async (qualificationId) => {
    try {
      const id = parseInt(qualificationId, 10);

      // 1. Fetch file storage path to clean up file if present
      const { data: existing } = await supabase
        .from('staff_details_qualifications')
        .select('document_path')
        .eq('id', id)
        .single();

      if (existing?.document_path) {
        try {
          await supabase.storage.from(BUCKET_NAME).remove([existing.document_path]);
        } catch (e) {
          console.warn('Cleanup storage file warning:', e.message);
        }
      }

      // 2. Delete DB record
      const { error } = await supabase
        .from('staff_details_qualifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true, message: 'Qualification deleted successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};
