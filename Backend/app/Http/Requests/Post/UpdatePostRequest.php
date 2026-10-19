<?php

namespace App\Http\Requests\Post;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'content' => ['sometimes', 'required', 'string'],
            'religious_reference' => ['nullable', 'string'],
            'scientific_reference' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:pending,published,rejected'],
            'media' => ['nullable', 'array', 'max:10'],
            'media.*' => ['file', 'max:20480', 'mimes:jpeg,png,jpg,gif,webp,mp4,mov,avi,webm,pdf'],
        ];
    }
}
