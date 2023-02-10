/**
 * Simple的3D渲染
 */

class Utility {

    /**
     * all expressed in byte view
     * @param from_arr
     * @param from_start_idx
     * @param to_arr
     * @param to_start_idx
     * @param length
     * @constructor
     */
    static Array_Copy(from_arr, from_start_idx, to_arr, to_start_idx, length) {

        let from = new Uint8Array(from_arr);
        let to = new Uint8Array(to_arr);
        for (let i = 0; i < length; i++) {
            to[to_start_idx + i] = from[from_start_idx + i];
        }
    }
}

class Vector4 {

    __data = new Float32Array(4);

    get data() {

        return this.__data;
    }

    set_xyzw(x, y, z, w) {

        this.__data[0] = x;
        this.__data[1] = y;
        this.__data[2] = z;
        this.__data[3] = w;
    };

    copy_from(vec4) {

        this.__data[0] = vec4.data[0];
        this.__data[1] = vec4.data[1];
        this.__data[2] = vec4.data[2];
        this.__data[3] = vec4.data[3];
    }

    to_0001() {

        this.__data[0] = 0.0;
        this.__data[1] = 0.0;
        this.__data[2] = 0.0;
        this.__data[3] = 1.0;
    }
}

/**
 * Column Major Matrix
 */
class Matrix4x4 {

    static __temp_data = new Float32Array(16);

    __data = new Float32Array(16);

    get data() {

        return this.__data;
    }

    constructor() {

        this.to_identity();
    }

    /**
     * 意为先应用矩阵in4x4再应用矩阵this
     * 形象理解为this矩阵时in4x4的父矩阵, in4x4随着父亲this的变换而变换
     * @param in4x4
     * @param out4x4
     */
    multiply4x4(in4x4, out4x4) {

        // column major
        // x  y  z  w
        // -----------
        // 0  4  8  12
        // 1  5  9  13
        // 2  6  10 14
        // 3  7  11 15
        // -----------

        let l = this.data;//左边
        let r = in4x4.data;//右边
        let o = out4x4.data;//输出

        // l * r

        o[0] = l[0] * r[0] + l[4] * r[1] + l[8] * r[2] + l[12] * r[3];
        o[1] = l[1] * r[0] + l[5] * r[1] + l[9] * r[2] + l[13] * r[3];
        o[2] = l[2] * r[0] + l[6] * r[1] + l[10] * r[2] + l[14] * r[3];
        o[3] = l[3] * r[0] + l[7] * r[1] + l[11] * r[2] + l[15] * r[3];

        o[4] = l[0] * r[4] + l[4] * r[5] + l[8] * r[6] + l[12] * r[7];
        o[5] = l[1] * r[4] + l[5] * r[5] + l[9] * r[6] + l[13] * r[7];
        o[6] = l[2] * r[4] + l[6] * r[5] + l[10] * r[6] + l[14] * r[7];
        o[7] = l[3] * r[4] + l[7] * r[5] + l[11] * r[6] + l[15] * r[7];

        o[8] = l[0] * r[8] + l[4] * r[9] + l[8] * r[10] + l[12] * r[11];
        o[9] = l[1] * r[8] + l[5] * r[9] + l[9] * r[10] + l[13] * r[11];
        o[10] = l[2] * r[8] + l[6] * r[9] + l[10] * r[10] + l[12] * r[11];
        o[11] = l[3] * r[8] + l[7] * r[9] + l[11] * r[10] + l[15] * r[11];

        o[12] = l[0] * r[12] + l[4] * r[13] + l[8] * r[14] + l[12] * r[15];
        o[13] = l[1] * r[12] + l[5] * r[13] + l[9] * r[14] + l[13] * r[15];
        o[14] = l[2] * r[12] + l[6] * r[13] + l[10] * r[14] + l[14] * r[15];
        o[15] = l[3] * r[12] + l[7] * r[13] + l[11] * r[14] + l[15] * r[15];
    }

    multiply4(in4, out4) {

        let l = this.__data;
        let r = in4.__data;
        let o = out4.__data;

        o[0] = l[0] * r[0] + l[4] * r[1] + l[8] * r[2] + l[12] * r[3];
        o[1] = l[1] * r[0] + l[5] * r[1] + l[9] * r[2] + l[13] * r[3];
        o[2] = l[2] * r[0] + l[6] * r[1] + l[10] * r[2] + l[14] * r[3];
        o[3] = l[3] * r[0] + l[7] * r[1] + l[11] * r[2] + l[15] * r[3];
    }

    inverse(out4x4) {

        //计算伴随矩阵
        let d = this.__data;
        let o = out4x4.__data;

        for (let c = 0; c < 4; c++) {
            for (let r = 0; r < 4; r++) {
                o[c * 4 + r] = Math.pow(-1, c + r) * this.determinant_order_3(c, r);
            }
        }

        //计算这个4x4矩阵的行列式
        let determinant = d[0] * o[0] + d[1] * o[1] + d[2] * o[2] + d[3] * o[3];

        if (determinant === 0) {
            //没有行列式
            throw new Error("无逆矩阵")
        }

        for (let i = 0; i < 16; i++) {
            o[i] /= determinant;
        }
    }

    transpose(out4x4) {

        let d = this.__data;
        let o = out4x4.__data;
        for (let c = 0; c < 4; c++) {
            for (let r = 0; r < 4; r++) {
                o[r * 4 + c] = d[c * 4 + r];
            }
        }
    }

    transpose_self(out4x4) {

        let d = this.__data;
        let temp = 0;
        for (let c = 0; c < 4; c++) {
            for (let r = c; r < 4; r++) {
                temp = d[r * 4 + c];
                d[r * 4 + c] = d[c * 4 + r];
                d[c * 4 + r] = temp;
            }
        }
    }

    inverse_transpose(out4x4) {

        this.inverse(out4x4);
        out4x4.transpose_self();
    }

    /**
     * 专门用来计算3阶行列式的
     */
    determinant_order_3(ignore_column, ignore_row) {

        let d = this.__data;
        let product_a = 1;
        let product_b = 1;
        let sum = 0;
        let cols_arr = [];
        let rows_arr = [];
        for (let i = 0; i < 4; i++) {
            if (i !== ignore_column) {
                cols_arr.push(i);
            }
            if (i !== ignore_row) {
                rows_arr.push(i);
            }
        }
        for (let col_idx = 0; col_idx < 3; col_idx++) {
            product_a = product_b = 1;
            for (let i = 0; i < 3; i++) {
                product_a *= d[cols_arr[(col_idx + i) % 3] * 4 + rows_arr[i]];
                product_b *= d[cols_arr[(col_idx + i) % 3] * 4 + rows_arr[2 - i]];
            }
            sum += product_a - product_b;
        }

        return sum;
    }

    get(c, r) {

        return this.__data[c * 4 + r];
    }

    set(c, r, v) {

        this.__data[c * 4 + r] = v;
    }

    to_identity() {

        this.data[0] = 1.0;
        this.data[1] = 0.0;
        this.data[2] = 0.0;
        this.data[3] = 0.0;

        this.data[4] = 0.0;
        this.data[5] = 1.0;
        this.data[6] = 0.0;
        this.data[7] = 0.0;

        this.data[8] = 0.0;
        this.data[9] = 0.0;
        this.data[10] = 1.0;
        this.data[11] = 0.0;

        this.data[12] = 0.0;
        this.data[13] = 0.0;
        this.data[14] = 0.0;
        this.data[15] = 1.0;
    }

    inverse_z() {

        this.__data[8] *= -1.0;
        this.__data[9] *= -1.0;
        this.__data[10] *= -1.0;
    }

    clear_and_init_with_orthogonal(width, height, near, far) {

        let o = this.__data;
        
        o[0] = 2.0 / width;
        o[1] = 0.0;
        o[2] = 0.0;
        o[3] = 0.0;

        o[4] = 0.0;
        o[5] = 2.0 / height;
        o[6] = 0.0;
        o[7] = 0.0;

        o[8] = 0.0;
        o[9] = 0.0;
        o[10] = 2.0 / Math.abs(far - near);
        o[11] = 0.0;

        o[12] = 0.0;
        o[13] = 0.0;
        o[14] = -((far + near) / (far - near));
        o[15] = 1.0;
    }

    clear_and_init_with_perspective(near, far, fovy, aspect) {

        let o = this.__data;

        let f = 1.0 / Math.tan(fovy / 2);
        let nf = 1 / (far - near);

        o[0] = f / aspect;
        o[1] = 0;
        o[2] = 0;
        o[3] = 0;

        o[4] = 0;
        o[5] = f;
        o[6] = 0;
        o[7] = 0;

        o[8] = 0;
        o[9] = 0;
        o[10] = (far + near) * nf;
        o[11] = 1;

        o[12] = 0;
        o[13] = 0;
        o[14] = -2 * far * near * nf;
        o[15] = 0;
    }
}

/**
 * 四元数
 */
class Quaternion {

    s = 0;
    x = 0;
    y = 0;
    z = 0;

    set(s, x, y, z) {

        this.s = s;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    conjugate(q_out) {

        q_out.s = this.s;
        q_out.x = -this.x;
        q_out.y = -this.y;
        q_out.z = -this.z;
    }

    /**
     *   sasb−xaxb−yayb−zazb
     * +(saxb+sbxa+yazb−ybza)i
     * +(sayb+sbya+zaxb−zbxa)j
     * +(sazb+sbza+xayb−xbya)k
     * @param q_in
     * @param q_out
     */
    multiply(q_in, q_out) {

        let a = this;
        let b = q_in;
        let o = q_out;

        o.s = a.s * b.s - a.x * b.x - a.y * b.y - a.z * b.z;
        o.x = a.s * b.x + b.s * a.x + a.y * b.z - b.y * a.z;
        o.y = a.s * b.y + b.s * a.y + a.z * b.x - b.z * a.x;
        o.z = a.s * b.z + b.s * a.z + a.x * b.y - b.x * a.y;
    }

    normalize_pure_part() {

        let mag = Math.sqrt(Math.pow(this.x, 2.0) + Math.pow(this.y, 2.0) + Math.pow(this.z, 2.0));
        this.x /= mag;
        this.y /= mag;
        this.z /= mag;
    }

    become_point_quaternion(x, y, z) {

        this.s = 0.0;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    //cosθ=s1s2+x1x2+y1y2+z1z2 for norm q
    become_rotor_quaternion(x, y, z, radians) {

        this.x = x;
        this.y = y;
        this.z = z;
        this.normalize_pure_part();

        this.s = Math.cos(radians / 2.0);
        this.x *= Math.sin(radians / 2.0);
        this.y *= Math.sin(radians / 2.0);
        this.z *= Math.sin(radians / 2.0);
    }

    static __Rotate_Cached = {

        rotor_q: new Quaternion(),
        point_q: new Quaternion(),
        rotor_q_conjugate: new Quaternion(),
        temp_q: new Quaternion(),
        result_q: new Quaternion(),
        result_vec: new Vector4()
    };

    static Rotate(rotor_q, point_q, out_q) {

        rotor_q.conjugate(Quaternion.__Rotate_Cached.rotor_q_conjugate);
        rotor_q.multiply(point_q, Quaternion.__Rotate_Cached.temp_q);
        if (out_q === undefined) {
            out_q = Quaternion.__Rotate_Cached.result_q;
        }
        Quaternion.__Rotate_Cached.temp_q.multiply(Quaternion.__Rotate_Cached.rotor_q_conjugate, out_q);
    }

    static Rotate_vector(rotor_vec, point_vec, radians, out_vec) {

        Quaternion.__Rotate_Cached.rotor_q.become_rotor_quaternion(rotor_vec.data[0], rotor_vec.data[1], rotor_vec.data[2], radians);
        Quaternion.__Rotate_Cached.point_q.become_point_quaternion(point_vec.data[0], point_vec.data[1], point_vec.data[2],);
        Quaternion.__Rotate_Cached.rotor_q.conjugate(Quaternion.__Rotate_Cached.rotor_q_conjugate);
        Quaternion.__Rotate_Cached.rotor_q.multiply(this.__Rotate_Cached.point_q, Quaternion.__Rotate_Cached.temp_q);
        if (out_vec === undefined) {
            out_vec = Quaternion.__Rotate_Cached.result_vec;
        }
        Quaternion.__Rotate_Cached.temp_q.multiply(Quaternion.__Rotate_Cached.rotor_q_conjugate, Quaternion.__Rotate_Cached.result_q);
        out_vec.data[0] = Quaternion.__Rotate_Cached.result_q.x;
        out_vec.data[1] = Quaternion.__Rotate_Cached.result_q.y;
        out_vec.data[2] = Quaternion.__Rotate_Cached.result_q.z;
    }

    static Get_Rotate_Result_Quaternion() {

        return this.__Rotate_Cached.result_q;
    }

    static Get_Rotate_Result_Vector4() {

        return this.__Rotate_Cached.result_vec;
    }
}

class Transform {

    __transform_mat = new Matrix4x4();

    __rotation = {x: 0, y: 0, z: 0};
    __scale = {x: 1.0, y: 1.0, z: 1.0};
    __translation = {x: 0, y: 0, z: 0};

    __need_update = false;

    static __Update_Matrix_Cached = {
        axis_vec: new Vector4(),
        point_vec: new Vector4(),
        result_vec: new Vector4()
    };

    set_rotation(x, y, z) {

        this.__rotation.x = x;
        this.__rotation.y = y;
        this.__rotation.z = z;
        this.__need_update = true;
    }

    set_scale(x, y, z) {

        this.__scale.x = x;
        this.__scale.y = y;
        this.__scale.z = z;
        this.__need_update = true;
    }

    set_translation(x, y, z) {

        this.__translation.x = x;
        this.__translation.y = y;
        this.__translation.z = z;
        this.__need_update = true;
    }

    __update_inner_matrix() {

        if (this.__need_update) {
            //先缩放，再旋转
            this.__transform_mat.to_identity();
            this.__transform_mat.data[0] = this.__scale.x;
            this.__transform_mat.data[5] = this.__scale.y;
            this.__transform_mat.data[10] = this.__scale.z;
            //绕y旋转xz
            Transform.__Update_Matrix_Cached.axis_vec.data[0] = this.__transform_mat.data[4];
            Transform.__Update_Matrix_Cached.axis_vec.data[1] = this.__transform_mat.data[5];
            Transform.__Update_Matrix_Cached.axis_vec.data[2] = this.__transform_mat.data[6];

            Transform.__Update_Matrix_Cached.point_vec.data[0] = this.__transform_mat.data[0];
            Transform.__Update_Matrix_Cached.point_vec.data[1] = this.__transform_mat.data[1];
            Transform.__Update_Matrix_Cached.point_vec.data[2] = this.__transform_mat.data[2];
            Quaternion.Rotate_vector(Transform.__Update_Matrix_Cached.axis_vec, Transform.__Update_Matrix_Cached.point_vec, this.__rotation.y, Transform.__Update_Matrix_Cached.result_vec);
            this.__transform_mat.data[0] = Transform.__Update_Matrix_Cached.result_vec.data[0];
            this.__transform_mat.data[1] = Transform.__Update_Matrix_Cached.result_vec.data[1];
            this.__transform_mat.data[2] = Transform.__Update_Matrix_Cached.result_vec.data[2];

            Transform.__Update_Matrix_Cached.point_vec.data[0] = this.__transform_mat.data[8];
            Transform.__Update_Matrix_Cached.point_vec.data[1] = this.__transform_mat.data[9];
            Transform.__Update_Matrix_Cached.point_vec.data[2] = this.__transform_mat.data[10];
            Quaternion.Rotate_vector(Transform.__Update_Matrix_Cached.axis_vec, Transform.__Update_Matrix_Cached.point_vec, this.__rotation.y, Transform.__Update_Matrix_Cached.result_vec);
            this.__transform_mat.data[8] = Transform.__Update_Matrix_Cached.result_vec.data[0];
            this.__transform_mat.data[9] = Transform.__Update_Matrix_Cached.result_vec.data[1];
            this.__transform_mat.data[10] = Transform.__Update_Matrix_Cached.result_vec.data[2];
            //绕x旋转yz
            Transform.__Update_Matrix_Cached.axis_vec.data[0] = this.__transform_mat.data[0];
            Transform.__Update_Matrix_Cached.axis_vec.data[1] = this.__transform_mat.data[1];
            Transform.__Update_Matrix_Cached.axis_vec.data[2] = this.__transform_mat.data[2];

            Transform.__Update_Matrix_Cached.point_vec.data[0] = this.__transform_mat.data[4];
            Transform.__Update_Matrix_Cached.point_vec.data[1] = this.__transform_mat.data[5];
            Transform.__Update_Matrix_Cached.point_vec.data[2] = this.__transform_mat.data[6];
            Quaternion.Rotate_vector(Transform.__Update_Matrix_Cached.axis_vec, Transform.__Update_Matrix_Cached.point_vec, this.__rotation.x, Transform.__Update_Matrix_Cached.result_vec);
            this.__transform_mat.data[4] = Transform.__Update_Matrix_Cached.result_vec.data[0];
            this.__transform_mat.data[5] = Transform.__Update_Matrix_Cached.result_vec.data[1];
            this.__transform_mat.data[6] = Transform.__Update_Matrix_Cached.result_vec.data[2];

            Transform.__Update_Matrix_Cached.point_vec.data[0] = this.__transform_mat.data[8];
            Transform.__Update_Matrix_Cached.point_vec.data[1] = this.__transform_mat.data[9];
            Transform.__Update_Matrix_Cached.point_vec.data[2] = this.__transform_mat.data[10];
            Quaternion.Rotate_vector(Transform.__Update_Matrix_Cached.axis_vec, Transform.__Update_Matrix_Cached.point_vec, this.__rotation.x, Transform.__Update_Matrix_Cached.result_vec);
            this.__transform_mat.data[8] = Transform.__Update_Matrix_Cached.result_vec.data[0];
            this.__transform_mat.data[9] = Transform.__Update_Matrix_Cached.result_vec.data[1];
            this.__transform_mat.data[10] = Transform.__Update_Matrix_Cached.result_vec.data[2];
            //绕z旋转xy
            Transform.__Update_Matrix_Cached.axis_vec.data[0] = this.__transform_mat.data[8];
            Transform.__Update_Matrix_Cached.axis_vec.data[1] = this.__transform_mat.data[9];
            Transform.__Update_Matrix_Cached.axis_vec.data[2] = this.__transform_mat.data[10];

            Transform.__Update_Matrix_Cached.point_vec.data[0] = this.__transform_mat.data[0];
            Transform.__Update_Matrix_Cached.point_vec.data[1] = this.__transform_mat.data[1];
            Transform.__Update_Matrix_Cached.point_vec.data[2] = this.__transform_mat.data[2];
            Quaternion.Rotate_vector(Transform.__Update_Matrix_Cached.axis_vec, Transform.__Update_Matrix_Cached.point_vec, this.__rotation.z, Transform.__Update_Matrix_Cached.result_vec);
            this.__transform_mat.data[0] = Transform.__Update_Matrix_Cached.result_vec.data[0];
            this.__transform_mat.data[1] = Transform.__Update_Matrix_Cached.result_vec.data[1];
            this.__transform_mat.data[2] = Transform.__Update_Matrix_Cached.result_vec.data[2];

            Transform.__Update_Matrix_Cached.point_vec.data[0] = this.__transform_mat.data[4];
            Transform.__Update_Matrix_Cached.point_vec.data[1] = this.__transform_mat.data[5];
            Transform.__Update_Matrix_Cached.point_vec.data[2] = this.__transform_mat.data[6];
            Quaternion.Rotate_vector(Transform.__Update_Matrix_Cached.axis_vec, Transform.__Update_Matrix_Cached.point_vec, this.__rotation.z, Transform.__Update_Matrix_Cached.result_vec);
            this.__transform_mat.data[4] = Transform.__Update_Matrix_Cached.result_vec.data[0];
            this.__transform_mat.data[5] = Transform.__Update_Matrix_Cached.result_vec.data[1];
            this.__transform_mat.data[6] = Transform.__Update_Matrix_Cached.result_vec.data[2];
            //再平移
            this.__transform_mat.data[12] = this.__translation.x;
            this.__transform_mat.data[13] = this.__translation.y;
            this.__transform_mat.data[14] = this.__translation.z;
        }
    }
}

class Array_Buffer_Desc {

    __elem_type = null;
    __elem_cnt_per_stride = null;
    __whether_normalize = null;
    __stride_cnt = null;
    __offset_cnt = null;

    constructor(elem_type, elem_cnt_per_stride, whether_normalize, stride_cnt, offset_cnt) {
        this.__elem_type = elem_type;
        this.__elem_cnt_per_stride = elem_cnt_per_stride;
        this.__whether_normalize = whether_normalize;
        this.__stride_cnt = stride_cnt;
        this.__offset_cnt = offset_cnt;
    }

    can_fit_into(desc) {

        return (this.__elem_type === desc.__elem_type
            && this.__elem_cnt_per_stride <= desc.__elem_cnt_per_stride
            && this.__stride_cnt <= desc.__stride_cnt);
    }

    format_equal_with(desc) {

        return (this.__elem_type === desc.__elem_type
            && this.__elem_cnt_per_stride <= desc.__elem_cnt_per_stride
            && this.__stride_cnt === desc.__stride_cnt);
    }

    elem_cnt_per_stride_size_in_byte() {

        return Array_Buffer_Desc.This_Type_To_Size_Bytes(this.__elem_type) * this.__elem_cnt_per_stride;
    }

    stride_size_in_byte() {

        return Array_Buffer_Desc.This_Type_To_Size_Bytes(this.__elem_type) * this.__stride_cnt;
    }

    offset_size_in_byte() {

        return Array_Buffer_Desc.This_Type_To_Size_Bytes(this.__elem_type) * this.__offset_cnt;
    }

    static get ELEM_TYPE_FLOAT() {

        return 4;
    }

    static This_Type_To_WebGL_Type(gl, this_type) {

        switch (this_type) {
            case Array_Buffer_Desc.ELEM_TYPE_FLOAT:
                return gl.FLOAT;
            default:
                return null;
        }
    }

    static This_Type_To_Size_Bytes(this_type) {

        switch (this_type) {
            case Array_Buffer_Desc.ELEM_TYPE_FLOAT:
                return 4;
            default:
                return null;
        }
    }
}

class __Mesh_Attr {

    constructor(mesh_attr_name) {

        if (arguments.length !== 1) {
            throw new Error("参数数量错误! 传入" + arguments.length + "个但是需要1个");
        }
        this.mesh_attr_name = mesh_attr_name;
    }

    mesh_attr_name = "";
    cpu_buffer = null;
    gpu_buffer = null;
    buffer_desc = null;
}

class __Mesh {

    constructor(mesh_name) {

        if (arguments.length !== 1) {
            throw new Error("参数数量错误! 传入" + arguments.length + "个但是需要1个");
        }
        this.mesh_name = mesh_name;
    }

    mesh_name = "";
    attr_map = new Map();
    has_idx_buffer = false;
    vertex_or_idx_cnt = 0;
    cpu_idx_buffer = null;
    gpu_idx_buffer = null;
}

class SL_Type {

    copy_from(float32) {

    }

    static Copy_Float32(from, from_start, to, to_start, length) {
        for (let i = 0; i < length; i++) {
            to[to_start + i] = from[from_start + i];
        }
    }
}

/**
 * Shading Language Type
 */
class SL_Type_Float {

    data = new Float32Array(1);

    copy_from(float32, from_start) {

        SL_Type.Copy_Float32(float32, from_start, this.data, 0, this.data.length);
    }
}

/**
 * Shading Language Type
 */
class SL_Type_Vec4 {

    data = new Float32Array(4);

    copy_from(float32, from_start) {

        SL_Type.Copy_Float32(float32, from_start, this.data, 0, this.data.length);
    }
}

/**
 * Shading Language Type
 */
class SL_Type_Mat4 {

    data = new Float32Array(16);

    copy_from(float32_from, from_start) {

        SL_Type.Copy_Float32(float32_from, from_start, this.data, 0, this.data.length);
    }
}

class Program_Ctx {

    vs = null;
    fs = null;
    program = null;
    per_vertex_attr_location_map = new Map();
    uniform_location_map = new Map();
    per_instance_attr_location_map = new Map();
}

class Material {

    __s3r_belongs_to = null;
    //使用的着色器
    __program_ctx_used = null;
    //使用的网格
    __mesh_used = null;
    //使用的纹理
    __textures_used_map = new Map();
    //使用的uniform
    __uniform_data_map = new Map();

    constructor(s3r) {

        this.__s3r_belongs_to = s3r;
    }

    use_program(prog_name) {

        //TODO: 找不到报错
        this.__program_ctx_used = this.__s3r_belongs_to.__program_ctx_map.get(prog_name);
    }

    use_mesh(mesh_name) {

        this.__mesh_used = this.__s3r_belongs_to.get_mesh(mesh_name);
        if (this.__mesh_used === null) {
            throw new Error("mesh不存在");
        }
    }

    /**
     *
     * @param name
     * @param type SL_Type_Vec4 SL_Type_Mat4
     */
    add_uniform(name, type) {

        this.__uniform_data_map.set(name, new type());
    }

    /**
     *
     * @param name
     * @param float32_arr
     * @param from_idx
     */
    set_uniform(name, float32_arr, from_idx) {

        this.__uniform_data_map.get(name).copy_from(float32_arr, from_idx);
    }
}

class Graphics_obj extends Transform {

    id_str = "game object";

    __s3r_belongs_to = null;
    __parent_graphics_obj = null;

    __material = null;

    __temp_sl_type = new SL_Type_Mat4();

    constructor(s3r_belongs_to, parent_graphics_object) {

        if (arguments.length !== 2) {
            throw new Error("参数数量错误，需要2个")
        }

        super();
        this.__s3r_belongs_to = s3r_belongs_to;
        this.__parent_graphics_obj = parent_graphics_object;
        this.__material = new Material(s3r_belongs_to);
    }

    get_material() {

        return this.__material;
    }

    setup_shader_and_data() {

        this.__material.__s3r_belongs_to.setup_program(this.__material.__program_ctx_used.program);
        //set index buffer
        if (this.__material.__mesh_used.has_idx_buffer) {
            this.__material.__s3r_belongs_to.bind_global_idx_buffer(this.__material.__mesh_used.gpu_idx_buffer);
        }
        //设置每顶点
        for (let per_vertex_attr_location_kv of this.__material.__program_ctx_used.per_vertex_attr_location_map) {
            if (this.__material.__mesh_used.attr_map.has(per_vertex_attr_location_kv[0])) {
                let mesh_attr = this.__material.__mesh_used.attr_map.get(per_vertex_attr_location_kv[0]);
                if (mesh_attr.buffer_desc.can_fit_into(per_vertex_attr_location_kv[1].buffer_desc) === false) {
                    throw Error("每顶点属性" + per_vertex_attr_location_kv[0] + "格式不兼容");
                }
                this.__material.__s3r_belongs_to.setup_per_vertex_data(per_vertex_attr_location_kv[1].location, mesh_attr);
            }
        }
        //设置uniform
        for (let uniform_location_kv of this.__material.__program_ctx_used.uniform_location_map) {
            if (this.__material.__uniform_data_map.has(uniform_location_kv[0])) {
                if (uniform_location_kv[0] === "s3r_u_mat4_m") {
                    this.__temp_sl_type.copy_from(this.__transform_mat.data, 0);
                    this.__material.__s3r_belongs_to.setup_uniform_data(uniform_location_kv[1].location, this.__temp_sl_type);
                } else {
                    let uniform_data = this.__material.__uniform_data_map.get(uniform_location_kv[0]);
                    if (uniform_data.data_type !== uniform_location_kv.data_type) {
                        throw Error("Uniform属性" + uniform_location_kv[0] + "格式不兼容");
                    }
                    this.__material.__s3r_belongs_to.setup_uniform_data(uniform_location_kv[1].location, uniform_data);
                }
            }
        }
    }

    push_instance_data_to_data_arr(arr_map) {

    }
}

class Simple_3D_Renderer {

    __cvs = null;
    __gl = null;

    __default_program_ctx = null;
    __program_ctx_map = new Map();

    __static = {
        mesh_map: new Map(),
        text_mesh_map: new Map()
    };

    __config = {
        clear_flag: 0,
        clear_color: null,
        clear_depth: 0
    };

    Constants = {

        get CLEAR_COLOR_BUFFER() {
            return 0b00000001;
        },
        get CLEAR_DEPTH_BUFFER() {

            return 0b00000010;
        }
    };

    create_program_ctx(ctx_name, vs_code, fs_code, attr_desc) {

        let ctx = new Program_Ctx();
        ctx.vs = this.create_shader(vs_code, this.__gl.VERTEX_SHADER);
        ctx.fs = this.create_shader(fs_code, this.__gl.FRAGMENT_SHADER);
        ctx.program = this.create_program(ctx.vs, ctx.fs);

        for (let attr_name in attr_desc.per_vertex) {
            ctx.per_vertex_attr_location_map.set(
                attr_name,
                {
                    location: this.__gl.getAttribLocation(ctx.program, attr_name),
                    buffer_desc: attr_desc.per_vertex[attr_name]
                }
            );
        }

        for (let attr_name in attr_desc.uniform) {
            ctx.uniform_location_map.set(
                attr_name,
                {
                    location: this.__gl.getUniformLocation(ctx.program, attr_name),
                    data_type: attr_desc.uniform[attr_name]
                }
            );
        }

        this.__program_ctx_map.set(ctx_name, ctx);
        return ctx;
    }

    init(cvs) {

        this.__cvs = cvs;
        this.__gl = cvs.getContext(
            "webgl2",
            {
                alpha: false,
                preserveDrawingBuffer: true
            }
        );

        if (this.__gl === null) {
            throw new Error("无法获取webgl2上下文");
        }

        //config
        this.__config.clear_flag = this.__gl.COLOR_BUFFER_BIT | this.__gl.DEPTH_BUFFER_BIT;
        this.__config.clear_color = [0.0, 0.0, 0.0, 0.0];
        this.__config.clear_depth = 1.0;

        let vs = `
              precision mediump float;
              uniform mat4 au_mat4_m; // 到世界坐标系
              uniform mat4 au_mat4_vp;// 到相机坐标系再到裁剪空间(GPU会自动做透视除法转换到NDC坐标系)
              uniform vec4 au_vec4_color;
              
              attribute vec4 a_vec4_pos;

              varying vec4 v_vec4_color;

              void main() {
              
                gl_Position = au_mat4_vp * au_mat4_m * a_vec4_pos;
                v_vec4_color = au_vec4_color;
              }
        `;

        let fs = `
              precision mediump float;

              varying vec4 v_vec4_color;

              void main() {
              
                gl_FragColor = v_vec4_color;
              }
        `;

        this.__default_program_ctx = this.create_program_ctx(
            "s3r_default",
            vs,
            fs,
            {
                per_vertex: {
                    a_vec4_pos: new Array_Buffer_Desc(Array_Buffer_Desc.ELEM_TYPE_FLOAT, 4, false, 4, 0)
                },
                uniform: {
                    au_mat4_m: SL_Type_Mat4,
                    au_mat4_vp: SL_Type_Mat4,
                    au_vec4_color: SL_Type_Vec4
                },
                per_instance: {}
            }
        );
    }

    is_mesh_exist(mesh_name) {

        return (this.__static.mesh_map.has(mesh_name));
    }

    is_mesh_attribute_exist(mesh_name, mesh_attribute_name) {

        if (this.is_mesh_exist(mesh_name)) {
            return (this.__static.mesh_map.get(mesh_name).attr_map.has(mesh_attribute_name));
        } else {
            return false;
        }
    }

    create_mesh(mesh_name, has_idx, vertex_or_idx_cnt, idx_arr) {

        let new_mesh = new __Mesh(mesh_name);
        this.__static.mesh_map.set(mesh_name, new_mesh);
        new_mesh.has_idx_buffer = has_idx;
        new_mesh.vertex_or_idx_cnt = vertex_or_idx_cnt;
        if (has_idx) {
            //应该上传索引缓冲
            let cpu_idx_buffer = new Uint16Array(idx_arr.length);
            for (let i = 0; i < idx_arr.length; i++) {
                cpu_idx_buffer[i] = idx_arr[i];
            }
            new_mesh.cpu_idx_buffer = cpu_idx_buffer;
        }
    }

    update_mesh_attribute(mesh_name, mesh_attr_name, arr, elem_type, elem_cnt_per_stride, whether_normalize, stride_cnt, offset_cnt) {

        if (this.is_mesh_attribute_exist(mesh_name, mesh_attr_name)) {
            throw new Error("mesh attr 已存在");
        }
        if (this.is_mesh_exist(mesh_name) === false) {
            throw new Error("mesh name 不存在");
        }
        let mesh = this.__static.mesh_map.get(mesh_name);
        let mesh_attr = new __Mesh_Attr(mesh_attr_name);
        mesh.attr_map.set(mesh_attr_name, mesh_attr);
        // need 大改
        //上传cpu缓冲
        let cpu_buffer = new Float32Array(arr.length);
        for (let i = 0; i < arr.length; i++) {
            cpu_buffer[i] = arr[i];
        }
        mesh_attr.cpu_buffer = cpu_buffer;
        mesh_attr.buffer_desc = new Array_Buffer_Desc(elem_type, elem_cnt_per_stride, whether_normalize, stride_cnt, offset_cnt);
    }

    update_mesh_to_gpu(mesh_name) {

        //获取cpu buffer
        if (this.is_mesh_exist(mesh_name) === false) {
            throw new Error("mesh name 不存在");
        }
        let mesh = this.__static.mesh_map.get(mesh_name);
        if (mesh.has_idx_buffer) {
            let original_gpu_idx_buffer = mesh.gpu_idx_buffer;
            let new_gpu_buffer = this.__gl.createBuffer();
            if (new_gpu_buffer === null || new_gpu_buffer === undefined) {
                throw new Error("无法创建 gpu array buffer");
            }
            this.__gl.bindBuffer(this.__gl.ELEMENT_ARRAY_BUFFER, new_gpu_buffer);
            this.__gl.bufferData(this.__gl.ELEMENT_ARRAY_BUFFER, mesh.cpu_idx_buffer, this.__gl.STATIC_DRAW);
            mesh.gpu_idx_buffer = new_gpu_buffer;
            if (original_gpu_idx_buffer !== null) {
                this.__gl.deleteBuffer(original_gpu_idx_buffer);
            }
        }
        for (let mesh_attr_kv of mesh.attr_map) {
            let original_gpu_buffer = mesh_attr_kv[1].gpu_buffer;
            let new_gpu_buffer = this.__gl.createBuffer();
            if (new_gpu_buffer === null || new_gpu_buffer === undefined) {
                throw new Error("无法创建 gpu array buffer");
            }
            this.__gl.bindBuffer(this.__gl.ARRAY_BUFFER, new_gpu_buffer);
            this.__gl.bufferData(this.__gl.ARRAY_BUFFER, mesh_attr_kv[1].cpu_buffer, this.__gl.STATIC_DRAW);
            mesh_attr_kv[1].gpu_buffer = new_gpu_buffer;
            if (original_gpu_buffer !== null) {
                this.__gl.deleteBuffer(original_gpu_buffer);
            }
        }
    }

    setup_render_state(is_clear, go) {

        this.__gl.enable(this.__gl.CULL_FACE);
        this.__gl.frontFace(this.__gl.CW);
        this.__gl.cullFace(this.__gl.BACK);

        this.__gl.enable(this.__gl.DEPTH_TEST);
        this.__gl.depthFunc(this.__gl.LESS);

        this.__gl.viewport(0, 0, this.__cvs.width, this.__cvs.height);
    }

    set_clear_flag(clear_flag) {

        let final = 0;

        if (Simple_3D_Renderer.Constants.CLEAR_COLOR_BUFFER & clear_flag === 1) {
            final |= this.__gl.COLOR_BUFFER_BIT;
        }

        if (Simple_3D_Renderer.Constants.CLEAR_DEPTH_BUFFER & clear_flag === 1) {
            final |= this.__gl.DEPTH_BUFFER_BIT;
        }

        this.__config.clear_flag = final;
    }

    set_clear_color(r, g, b, a) {

        this.__config.clear_color[0] = r;
        this.__config.clear_color[1] = g;
        this.__config.clear_color[2] = b;
        this.__config.clear_color[3] = a;
    }

    set_clear_depth(depth_val) {

        this.__config.clear_depth = depth_val;
    }

    clear_frame_buffer() {

        this.__gl.clearColor(
            this.__config.clear_color[0],
            this.__config.clear_color[1],
            this.__config.clear_color[2],
            this.__config.clear_color[3]
        );
        this.__gl.clearDepth(this.__config.clear_depth);
        this.__gl.clear(this.__config.clear_flag);
    }

    render(go) {

        if (go.get_material().__mesh_used.has_idx_buffer) {
            this.__gl.drawElements(
                this.__gl.TRIANGLES,
                go.get_material().__mesh_used.vertex_or_idx_cnt,
                this.__gl.UNSIGNED_SHORT,
                0
            );
        } else {
            this.__gl.drawArrays(
                this.__gl.TRIANGLES,
                0,
                go.get_material().__mesh_used.vertex_or_idx_cnt,
            );
        }
    }

    end_render() {


    }

    setup_per_vertex_data(location, mesh_attr) {

        //设置slot准备渲染
        this.__gl.bindBuffer(this.__gl.ARRAY_BUFFER, mesh_attr.gpu_buffer);
        let cnt = 0;
        let base_location = location;
        let one_elem_bytes = Array_Buffer_Desc.This_Type_To_Size_Bytes(mesh_attr.buffer_desc.__elem_type);
        let cur_elem_cnt_per_stride = 0;
        let cur_stride_cnt_in_bytes = 0;
        let base_offset_cnt_in_bytes = 0;
        let cur_offset_cnt_in_bytes = 0;
        if (mesh_attr.buffer_desc.__elem_cnt_per_stride === 16) {
            //需要分成多个4
            cnt = 4;
            cur_elem_cnt_per_stride = 4;
            cur_stride_cnt_in_bytes = 4 * one_elem_bytes;
            base_offset_cnt_in_bytes = mesh_attr.buffer_desc.__offset_cnt * one_elem_bytes;
            cur_offset_cnt_in_bytes = 4 * one_elem_bytes;
        } else if (mesh_attr.buffer_desc.__elem_cnt_per_stride <= 4) {
            cnt = 1;
            cur_elem_cnt_per_stride = mesh_attr.buffer_desc.__elem_cnt_per_stride;
            cur_stride_cnt_in_bytes = mesh_attr.buffer_desc.__stride_cnt * one_elem_bytes;
            base_offset_cnt_in_bytes = mesh_attr.buffer_desc.__offset_cnt * one_elem_bytes;
            cur_offset_cnt_in_bytes = cur_stride_cnt_in_bytes;
        }
        for (let i = 0; i < cnt; i++) {
            let loc_real = base_location + i;
            this.__gl.vertexAttribPointer(
                loc_real,
                cur_elem_cnt_per_stride,
                Array_Buffer_Desc.This_Type_To_WebGL_Type(this.__gl, mesh_attr.buffer_desc.__elem_type),
                false,
                cur_stride_cnt_in_bytes,
                base_offset_cnt_in_bytes + i * cur_offset_cnt_in_bytes,
            );
            this.__gl.enableVertexAttribArray(loc_real);
        }
    }

    setup_uniform_data(location, sl_type_instance) {
        if (sl_type_instance instanceof SL_Type_Float) {
            this.__gl.uniform1fv(location, sl_type_instance.data);
        } else if (sl_type_instance instanceof SL_Type_Vec4) {
            this.__gl.uniform4fv(location, sl_type_instance.data);
        } else if (sl_type_instance instanceof SL_Type_Mat4) {
            this.__gl.uniformMatrix4fv(location, false, sl_type_instance.data);
        }
    }

    bind_global_idx_buffer(gpu_idx_buffer) {

        this.__gl.bindBuffer(this.__gl.ELEMENT_ARRAY_BUFFER, gpu_idx_buffer);
    }

    /**
     * webgl program
     * @param program
     */
    setup_program(program) {

        this.__gl.useProgram(program);
    }

    create_shader(shader_code, shader_type) {

        let shader = this.__gl.createShader(shader_type);
        this.__gl.shaderSource(shader, shader_code);
        this.__gl.compileShader(shader);
        if (this.__gl.getShaderParameter(shader, this.__gl.COMPILE_STATUS)) {
            //succeeded
            return shader;
        } else {
            //failed
            console.log(this.__gl.getShaderInfoLog(shader));
            this.__gl.deleteShader(shader);
            return null;
        }
    }

    create_program(vs, fs) {

        let program = this.__gl.createProgram();
        this.__gl.attachShader(program, vs);
        this.__gl.attachShader(program, fs);
        this.__gl.linkProgram(program);
        if (this.__gl.getProgramParameter(program, this.__gl.LINK_STATUS)) {
            //success
            return program;
        } else {
            console.log(this.__gl.getProgramInfoLog(program));
            this.__gl.deleteProgram(program);
            return null;
        }
    }

    __resize_gpu_buffer(gpu_buffer, new_size_bytes, usage) {

        this.__gl.bindBuffer(this.__gl.ARRAY_BUFFER, gpu_buffer);
        this.__gl.bufferData(this.__gl.ARRAY_BUFFER, new_size_bytes, usage);
    }

    /**
     * all arguments express in bytes
     * @param cpu_buffer
     * @param cpu_from
     * @param gpu_buffer
     * @param gpu_from
     * @param length
     */
    upload_cpu_to_gpu(cpu_buffer, cpu_from, gpu_buffer, gpu_from, length) {

        this.__gl.bindBuffer(this.__gl.ARRAY_BUFFER, gpu_buffer);
        let a = new Uint8Array(cpu_buffer);
        this.__gl.bufferSubData(this.__gl.ARRAY_BUFFER, gpu_from, a, cpu_from, length);
    }

    get_mesh(mesh_name) {

        let mesh = this.__static.mesh_map.get(mesh_name);
        if (mesh === null || mesh === undefined) {
            return null;
        }
        return mesh;
    }
}
