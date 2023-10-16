import { useState, useRef, useEffect } from 'react';
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { Modal } from "~/components/modal";
import { FormField } from '~/components/form-field';
import { SelectBox } from '~/components/select-box';
import { ImageUploader } from '~/components/image-uploader';
import { useLoaderData, useActionData } from "@remix-run/react";
import { getUser, requireUserId } from "~/utils/auth.server";
import { updateUser } from '~/utils/users.server';
import { departments } from '~/utils/constants';
import { fromZodError } from 'zod-validation-error';
import { ZodError } from "zod";
import { BasicForm, type UpdateAction } from '~/utils/types.server';
import { Department } from '@prisma/client';

const generateErrorObj = (err: ZodError): Record<string, string> => {
  const validationError = fromZodError(err);
  let errors: Record<string, string> = {};
  for (let i = 0; i < validationError.details.length; i++) {
    const { path, message } = validationError.details[i];
    errors = {
      ...errors,
      [path.toString()]: message
    }
  }
  return errors;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  return json({ user });
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const form = await request.formData();
  const firstName = form.get('firstName');
  const lastName = form.get('lastName');
  const department = form.get('department') as Department;
  const action = form.get("_action") as UpdateAction;

  switch (action) {
    case "save": {
      try {
        const basicInput = BasicForm.parse({ firstName, lastName });
        await updateUser(userId, {
          ...basicInput, department
        });
        return redirect('/home');
      } catch (err) {
        if (err instanceof ZodError) {
          const errors = generateErrorObj(err);
          return json({ errors, fields: { firstName, lastName, department }, form: action }, { status: 400 });
        }
        return json({ error: "Invalid form data", form: action }, { status: 400 });
      }
    }
    default:
      return json({ error: `Invalid Form Data` }, { status: 400 });
  }
}

export default function ProfileSettings() {
  const { user } = useLoaderData();
  const actionData = useActionData();
  const [formError, setFormError] = useState(actionData?.error || '')
  const firstLoad = useRef(true);

  const [formData, setFormData] = useState({
    firstName: actionData?.fields?.firstName || user?.profile?.firstName,
    lastName: actionData?.fields?.lastName || user?.profile?.lastName,
    department: actionData?.fields?.department || (user?.profile?.department || 'MARKETING'),
    profilePicture: user?.profile?.profilePicture || ''
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string): void => {
    setFormData(form => ({ ...form, [field]: event.target.value }));
  }

  useEffect(() => {
    if (!firstLoad.current) {
      setFormError('');
    }
  }, [formData]);

  useEffect(() => {
    firstLoad.current = false;
  }, []);

  const handleFileUpload = async (file: File) => {
    let inputFormData = new FormData()
    inputFormData.append('profile-pic', file)
    const response = await fetch('/avatar', {
      method: 'POST',
      body: inputFormData
    })
    const { imageUrl } = await response.json()
    setFormData({
      ...formData,
      profilePicture: imageUrl
    });
  }

  return (
    <Modal isOpen={true} className="w-1/3">
      <div className="p-3">
        <h2 className="text-4xl font-semibold text-blue-600 text-center mb-4">
          Your Profile
        </h2>
        <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full mb-2">
          {formError}
        </div>
        <div className='flex'>
          <div className="w-1/3">
            <ImageUploader onChange={handleFileUpload} imageUrl={formData.profilePicture || ''} />
          </div>
          <div className='flex-1'>
            <form method='POST'>
              <FormField
                htmlFor="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={e => handleInputChange(e, 'firstName')}
                error={actionData?.errors?.firstName}
              />
              <FormField
                htmlFor="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={e => handleInputChange(e, 'lastName')}
                error={actionData?.errors?.lastName}
              />
              <SelectBox
                className="w-full rounded-xl px-3 py-2 text-gray-400"
                id="department"
                name="department"
                label="Department"
                options={departments}
                value={formData.department}
                onChange={(e) => handleInputChange(e, 'department')}
              />
              <div className='w-full text-right mt-4'>
                <button
                  className="rounded-xl bg-yellow-300 font-semibold text-blue-600 px-16 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
                  name="_action"
                  value="save"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Modal>
  )
}
